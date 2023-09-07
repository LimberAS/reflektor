#!/bin/bash

# Inspiration: https://github.com/ehough/docker-nfs-server/blob/develop/entrypoint.sh

function check_status {
    if [ ! "$?" = 0 ]
    then
        echo "Command failed..."
        exit 1
    fi
}

function start()
{
    if [ -f /bin/setup.sh ];
    then
        echo "Running setup"
        source /bin/setup.sh
        echo "Setup finished"
    fi

    echo "Starting NFSv4"
    rpc.nfsd -V 4 -N 3 -N 2
    check_status
    rpc.mountd -V 4 -N 3 -N 2
    check_status
    exportfs -r
    check_status
    echo "Started"
}

function stop()
{
    echo "Stopping NFSv4"
    exportfs -auf
    kill $(pidof rpc.mountd)
    echo "Stopped"
    exit 0
}

# https://stackoverflow.com/questions/2683279/how-to-detect-if-a-script-is-being-sourced
(return 0 2>/dev/null) && SOURCED=1 || SOURCED=0
if [[ "$SOURCED" == "0" ]];
then
    trap stop TERM
    trap stop INT

    start

    # see inspiration at top
    while :; do sleep 2073600 & wait; done
fi
