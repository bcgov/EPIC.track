"""Custom converter to extract text from DraftJS JSON"""
import json


def draftjs_extractor(content_json: str) -> str:
    """Return text from dratjs json"""
    if not content_json:
        return ""
    try:
        content_state = json.loads(content_json)
        return " ".join(block["text"] for block in content_state.get("blocks", []))
    except json.JSONDecodeError:
        return ""
