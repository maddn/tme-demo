#!/bin/sh

cd ${NCS_RUN_DIR:-.}

ncs_load -u admin -l -m -O post-ncs-start-data/platform-infos.xml
