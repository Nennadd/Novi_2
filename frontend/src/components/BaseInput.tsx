type PropsType = {
  title: string;
  type: string;
  value: string;
  placeholder: string;
  required: boolean;
  autocomplete?: "off" | "on";
  setData: React.Dispatch<React.SetStateAction<string>>;
};

export const BaseInput = (props: PropsType) => {
  return (
    <div className="form-field">
      <label htmlFor={props.title}>{props.title}:</label>
      <input
        type={props.type}
        id={props.title}
        placeholder={props.placeholder}
        required={props.required}
        value={props.value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          props.setData(e.target.value)
        }
        autoComplete={props.autocomplete}
      />
    </div>
  );
};
