import { Fragment, useMemo } from 'react';
import { tokenize } from '../../lib/richtext.js';
import Cite from './Cite.jsx';

/** Rende il testo del paper con grassetto, corsivo, codice e citazioni interattive. */
export default function RichText({ text }) {
  const tokens = useMemo(() => tokenize(text), [text]);
  return tokens.map((token, i) => {
    switch (token.type) {
      case 'strong':
        return <strong key={i}>{token.value}</strong>;
      case 'em':
        return <em key={i}>{token.value}</em>;
      case 'code':
        return <code key={i}>{token.value}</code>;
      case 'cite':
        return <Cite key={i} ids={token.ids} raw={token.value} />;
      default:
        return <Fragment key={i}>{token.value}</Fragment>;
    }
  });
}
