export const highlightText = (text: string, query: string) => {
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index !== -1) {
    return (
      <>
        {text.substring(0, index)}
        <span style={{ backgroundColor: "rgb(255, 203, 127)" }}>
          {text.substring(index, index + query.length)}
        </span>
        {text.substring(index + query.length)}
      </>
    );
  }
  return text;
};
