// 공통 폼 프리미티브. 디자인 전용이라 상태 저장은 하지 않고
// defaultValue 로 표시만 한다.
import { useState } from 'react';

export function Field({ label, required, hint, full, children }) {
  return (
    <div className={'field' + (full ? ' full' : '')}>
      <label>{label}{required && <span className="req">*</span>}</label>
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

// onChange 가 있으면 controlled(value), 없으면 uncontrolled(defaultValue)
export function TextInput({ value, onChange, ...rest }) {
  if (onChange) return <input className="inp" value={value ?? ''} onChange={onChange} {...rest} />;
  return <input className="inp" defaultValue={value} {...rest} />;
}

export function Textarea({ value, onChange, tall, ...rest }) {
  if (onChange) return <textarea className={'inp' + (tall ? ' tall' : '')} value={value ?? ''} onChange={onChange} {...rest} />;
  return <textarea className={'inp' + (tall ? ' tall' : '')} defaultValue={value} {...rest} />;
}

export function Select({ value, onChange, options, ...rest }) {
  if (onChange) return (
    <select className="inp" value={value ?? options[0]} onChange={onChange} {...rest}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
  return (
    <select className="inp" defaultValue={value} {...rest}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function UnitInput({ value, unit, ...rest }) {
  return (
    <div className="inp-row">
      <input className="inp" defaultValue={value} {...rest} />
      <span className="unit">{unit}</span>
    </div>
  );
}

// 세그먼트(라디오 대용). 디자인 상태만 토글.
export function Segmented({ options, value, green }) {
  const [v, setV] = useState(value ?? options[0]);
  return (
    <div className={'seg' + (green ? ' green' : '')}>
      {options.map((o) => (
        <button type="button" key={o} className={v === o ? 'on' : ''} onClick={() => setV(o)}>{o}</button>
      ))}
    </div>
  );
}

export function Dropzone({ icon = '📎', title = '파일을 끌어다 놓거나 클릭하여 업로드', sub }) {
  return (
    <div className="dropzone">
      <div className="dz-ic">{icon}</div>
      <div className="dz-t">{title}</div>
      {sub && <div className="dz-s">{sub}</div>}
    </div>
  );
}
