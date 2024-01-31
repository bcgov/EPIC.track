import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import RichTextEditor, { RichTextEditorProps } from "../richTextEditor";

type ControlledRichTextEditorProps = RichTextEditorProps & {
  name: string;
};

const ControlledRichTextEditor: React.FC<ControlledRichTextEditorProps> = ({
  name,
  ...rest
}) => {
  const { control, formState } = useFormContext();
  const { defaultValues } = formState;
  const defaultValue =
    defaultValues && defaultValues[name] ? defaultValues[name] : "";
  return (
    <Controller
      name={name}
      defaultValue={defaultValue}
      control={control}
      render={({ field: { onChange }, fieldState: { error } }) => {
        return (
          <RichTextEditor
            handleEditorStateChange={onChange}
            initialRawEditorState={defaultValue}
            error={!!error}
            helperText={error?.message || ""}
            {...rest}
          />
        );
      }}
    />
  );
};

export default ControlledRichTextEditor;
