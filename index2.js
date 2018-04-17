import server from './src/server'
import { route } from './src/router'
import { start, upload, show } from './src/requestHandlers'

const handle = {}
handle['/'] = start
handle['/start'] = start
handle['/upload'] = upload
handle['/show'] = show
server.start(route, handle)
