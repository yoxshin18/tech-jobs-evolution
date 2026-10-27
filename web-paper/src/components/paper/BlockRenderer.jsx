import AdoptionAreaChart from '../charts/AdoptionAreaChart.jsx';
import EmploymentLineChart from '../charts/EmploymentLineChart.jsx';
import ExposureBars from '../charts/ExposureBars.jsx';
import GartnerTimeline from '../charts/GartnerTimeline.jsx';
import RoleRadarChart from '../charts/RoleRadarChart.jsx';
import SalaryBarChart from '../charts/SalaryBarChart.jsx';
import WefBarChart from '../charts/WefBarChart.jsx';
import Reveal from '../ui/Reveal.jsx';
import Callout from './Callout.jsx';
import CiteBlock from './CiteBlock.jsx';
import EmergingRoles from './EmergingRoles.jsx';
import Figure from './Figure.jsx';
import KpiGrid from './KpiGrid.jsx';
import References from './References.jsx';
import RichText from './RichText.jsx';
import RoleCards from './RoleCards.jsx';
import RoleTable from './RoleTable.jsx';
import Scenarios from './Scenarios.jsx';

const CHARTS = {
  adoption: { Component: AdoptionAreaChart, derived: true },
  employment: { Component: EmploymentLineChart, derived: true },
  exposure: { Component: ExposureBars, derived: true },
  radar: { Component: RoleRadarChart, derived: true },
  salary: { Component: SalaryBarChart, derived: false },
  wef: { Component: WefBarChart, derived: false },
  gartner: { Component: GartnerTimeline, derived: false },
};

/** Riga a due colonne stile Distill: testo a sinistra, nota a margine a destra. */
function Row({ children, note, wide = false }) {
  if (wide) return <div className="min-w-0 lg:col-span-2">{children}</div>;
  return (
    <>
      <div className="min-w-0">{children}</div>
      <aside className="hidden lg:block">
        {note && (
          <Reveal className="sticky top-24 border-l border-accent-indigo/50 pl-3 font-sans text-xs leading-relaxed text-fg-muted">
            <RichText text={note} />
          </Reveal>
        )}
      </aside>
    </>
  );
}

export default function BlockRenderer({ block, figureNumbers }) {
  switch (block.type) {
    case 'h3':
      return (
        <Row>
          <Reveal as="h3" id={block.id} className="mb-4 mt-14 scroll-mt-24 font-sans text-xl font-semibold tracking-tight text-fg first:mt-0">
            {block.text}
          </Reveal>
        </Row>
      );
    case 'p':
      return (
        <Row note={block.note}>
          <Reveal as="p" className={`mb-6 ${block.lead ? 'lead-prose' : 'paper-prose'}`}>
            <RichText text={block.text} />
          </Reveal>
          {block.note && (
            <p className="-mt-3 mb-6 border-l border-accent-indigo/50 pl-3 font-sans text-xs leading-relaxed text-fg-muted lg:hidden">
              <RichText text={block.note} />
            </p>
          )}
        </Row>
      );
    case 'list':
      return (
        <Row>
          <ul className="mb-6 space-y-3">
            {block.items.map((item, i) => (
              <Reveal as="li" key={i} delay={i * 0.05} className="paper-prose flex gap-3">
                <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 bg-accent-cyan" aria-hidden="true" />
                <span>
                  <RichText text={item} />
                </span>
              </Reveal>
            ))}
          </ul>
        </Row>
      );
    case 'keywords':
      return (
        <Row>
          <div className="mb-8 flex flex-wrap items-center gap-1.5">
            <span className="label-mono mr-2">{block.label}</span>
            {block.items.map((k) => (
              <span key={k} className="border border-line px-2 py-0.5 font-mono text-[10px] text-fg-muted">
                {k}
              </span>
            ))}
          </div>
        </Row>
      );
    case 'callout':
      return (
        <Row>
          <Callout {...block} />
        </Row>
      );
    case 'kpis':
      return (
        <Row wide>
          <KpiGrid items={block.items} />
        </Row>
      );
    case 'figure': {
      const chart = CHARTS[block.chart];
      if (!chart) return null;
      const { Component } = chart;
      return (
        <Row wide>
          <Figure id={block.chart} number={figureNumbers[block.chart]} derived={chart.derived}>
            <Component />
          </Figure>
        </Row>
      );
    }
    case 'roleCards':
      return (
        <Row wide>
          <RoleCards />
        </Row>
      );
    case 'roleTable':
      return (
        <Row wide>
          <RoleTable />
        </Row>
      );
    case 'emerging':
      return (
        <Row wide>
          <EmergingRoles />
        </Row>
      );
    case 'scenarios':
      return (
        <Row wide>
          <Scenarios />
        </Row>
      );
    case 'references':
      return (
        <Row>
          <References />
        </Row>
      );
    case 'cite':
      return (
        <Row>
          <CiteBlock label={block.label} text={block.text} />
        </Row>
      );
    default:
      return null;
  }
}
