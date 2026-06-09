import React from 'react';
import { forwardRef } from 'react';

import { useQuerySelection } from './QuerySelectionContext';

const ConnectionInfo = forwardRef(function ConnectionInfo(props, ref) {
  const { actualLineAngle, hide, ...connectionInfo } = props;
  const { connections: connectionsQuery } = useQuerySelection();
  const spacing_em = 1.625;
  const angle = 360-actualLineAngle;

  const visibleInfo = connectionsQuery.selection.map(leaf => {
    const name = leaf.split('/').pop();
    const prop = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    return {
      label: name[0].toUpperCase(),
      value: connectionInfo[prop]
    };
  }).filter(({ value }) => value);

  const offset = (visibleInfo.length - 1)/2 * spacing_em;

  return (
    !hide ? <React.Fragment>
      {visibleInfo.map(({ label, value }, index) =>
      <div className="topology__connection-info" key={label} style={{
        transform: `rotate(${angle}deg) translate(0, ${index*spacing_em - offset}em)`
      }}>
        <div className="topology__metric">{label}</div>
        <div className="topology__metric-value">{value}</div>
      </div>)}
    </React.Fragment>
  : null);
});

export default ConnectionInfo;
