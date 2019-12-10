This server application is used for communication and collecting data from KNX systems via KNX-IP.

Here is what you will make for usage :

1. `npm install` form installing missing npm packages
1. Run `tsc` command to build typescript. This will create **/dist** folder and save the files built in to it.
2. Go to dist folder just created and run  `node index.js --knxIp "<knx_ip_router_address>" --knxPort <knx_ip_router_port>`
3. That's all
 
Application will connect and start collecting data from knx system.
