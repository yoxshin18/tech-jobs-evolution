import Reveal from '../ui/Reveal.jsx';
import Tag from '../ui/Tag.jsx';
import RichText from './RichText.jsx';

export default function Callout({ tag, title, text }) {
  return (
    <Reveal className="relative my-10 border border-line border-l-accent-indigo bg-surface/70 pl-5 pr-5 pt-8 pb-5 [border-left-width:3px]">
      <div className="absolute left-0 top-0">
        <Tag>{tag}</Tag>
      </div>
      <p className="font-sans text-sm font-semibold text-fg">{title}</p>
      <p className="mt-2 font-sans text-sm leading-relaxed text-fg-muted">
        <RichText text={text} />
      </p>
    </Reveal>
  );
}
