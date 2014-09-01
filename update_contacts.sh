#!/bin/bash
google contacts list --fields name,phone --title="" | grep -v None | ~/bin/google-contacts-to-asterisk.js | sudo sh 2>&1 >/dev/null
