# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Validation for user-uploaded Excel files.

The import endpoints feed uploads straight into pandas/openpyxl, which load the
whole workbook into memory. XLSX is zip-compressed, so a small request body can
decompress into a huge in-memory payload (zip bomb). These checks bound the
compressed size, the decompressed size, the archive entry count and the number
of worksheets before any parsing happens; the decompressed-size cap is what
bounds row counts (and therefore DataFrame memory).
"""
import os
import zipfile

from werkzeug.datastructures import FileStorage

from api.exceptions import BadRequestError


EXCEL_MIME_TYPES = {
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    # clients that don't sniff the type fall back to octet-stream; the MIME
    # header is attacker-controlled anyway, the zip checks below are the gate
    "application/octet-stream",
}
# 5MB upload size and 50MB decompressed size verified by Connor to be workable
MAX_EXCEL_UPLOAD_SIZE = int(os.getenv("MAX_EXCEL_UPLOAD_SIZE", str(5 * 1024 * 1024)))
MAX_EXCEL_DECOMPRESSED_SIZE = int(os.getenv("MAX_EXCEL_DECOMPRESSED_SIZE", str(50 * 1024 * 1024)))
MAX_EXCEL_ARCHIVE_ENTRIES = 500
MAX_EXCEL_WORKSHEETS = 20


def validate_excel_upload(file: FileStorage) -> FileStorage:
    """Validate the size, type and zip structure of an uploaded Excel file before parsing it."""
    filename = file.filename or ""
    if not filename.lower().endswith(".xlsx"):
        raise BadRequestError("Only .xlsx files are accepted")
    if file.mimetype and file.mimetype not in EXCEL_MIME_TYPES:
        raise BadRequestError("Unexpected content type for an Excel upload")

    stream = file.stream
    stream.seek(0, os.SEEK_END)
    size = stream.tell()
    stream.seek(0)
    if size > MAX_EXCEL_UPLOAD_SIZE:
        raise BadRequestError(
            f"File exceeds the maximum allowed size of {MAX_EXCEL_UPLOAD_SIZE // (1024 * 1024)} MB"
        )

    try:
        with zipfile.ZipFile(stream) as archive:
            entries = archive.infolist()
    except zipfile.BadZipFile as exc:
        raise BadRequestError("File is not a valid Excel (.xlsx) file") from exc

    # An OOXML workbook always contains xl/workbook.xml; without it this is some
    # other zip-based format (e.g. ODS) that pandas would route to another engine
    if not any(entry.filename.lower() == "xl/workbook.xml" for entry in entries):
        raise BadRequestError("File is not a valid Excel (.xlsx) file")
    if len(entries) > MAX_EXCEL_ARCHIVE_ENTRIES:
        raise BadRequestError("Excel file contains too many internal entries")
    if sum(entry.file_size for entry in entries) > MAX_EXCEL_DECOMPRESSED_SIZE:
        raise BadRequestError("Excel file decompresses to more than the allowed size")
    worksheet_count = sum(1 for entry in entries if entry.filename.startswith("xl/worksheets/"))
    if worksheet_count > MAX_EXCEL_WORKSHEETS:
        raise BadRequestError("Excel file contains too many worksheets")

    stream.seek(0)
    return file
