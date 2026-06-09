import React from 'react';

import DroppableNodeList from './DroppableNodeList';


function DeviceList({ select, ...rest }) {
  console.debug('DeviceList Render');

  return (
    <DroppableNodeList
      allowDrop={true}
      disableCreate={true}
      disableGoTo={true}
      isLeafList={true}
      baseSelect={select}
      { ...rest }
    />
  );
}

export default DeviceList;
