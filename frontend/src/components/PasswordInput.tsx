import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput(props: any) {
  const [show, setShow] = useState(false);
  const { className = "form-input", ...rest } = props;

  return (
    <div style={{ position: 'relative' }}>
      <input 
        {...rest} 
        type={show ? 'text' : 'password'} 
        className={className} 
        style={{ paddingRight: '40px', ...props.style }} 
      />
      <button 
        type="button" 
        onClick={() => setShow(!show)} 
        aria-label={show ? "Hide password" : "Show password"}
        className="password-toggle-btn"
      >
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}
