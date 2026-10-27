/**
 * Mini-parser per il testo del paper (nessuna dipendenza):
 *   **grassetto**, *corsivo*, `codice` e citazioni [3], [1, 2], [11–17].
 * Restituisce una lista di token { type, value } renderizzati da <RichText/>.
 */
const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[\d+(?:\s*[,–-]\s*\d+)*\])/g;

export function expandCitation(raw) {
  const ids = [];
  raw
    .replace(/[[\]\s]/g, '')
    .split(',')
    .forEach((part) => {
      const range = part.split(/[–-]/).map(Number);
      if (range.length === 2) {
        for (let i = range[0]; i <= range[1]; i += 1) ids.push(i);
      } else {
        ids.push(range[0]);
      }
    });
  return ids.filter((n) => Number.isFinite(n));
}

export function tokenize(text = '') {
  return text
    .split(TOKEN)
    .filter((part) => part !== '')
    .map((part) => {
      if (part.startsWith('**')) return { type: 'strong', value: part.slice(2, -2) };
      if (part.startsWith('`')) return { type: 'code', value: part.slice(1, -1) };
      if (part.startsWith('*')) return { type: 'em', value: part.slice(1, -1) };
      if (/^\[\d/.test(part)) return { type: 'cite', value: part, ids: expandCitation(part) };
      return { type: 'text', value: part };
    });
}
