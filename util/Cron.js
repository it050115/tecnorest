const log = require("./log")(__filename)
const cron = require("node-cron")
//https://www.npmjs.com/package/node-cron

class Cron {
	constructor(sched, title, func) {
		this.title = title
		this.sched = sched
		/**
		Allowed fields
		# ┌────────────── second (optional)
		# │ ┌──────────── minute
		# │ │ ┌────────── hour
		# │ │ │ ┌──────── day of month
		# │ │ │ │ ┌────── month
		# │ │ │ │ │ ┌──── day of week
		# │ │ │ │ │ │
		# │ │ │ │ │ │
		# * * * * * *

		Allowed values
		field          value
		second	      0-59
		minute	      0-59
		hour           0-23
		day of month	1-31
		month	         1-12 (or names)
		day of week	   0-7 (or names, 0 or 7 are sunday)
		*/
		this.task = cron.schedule(
			sched,
			() => {
				//log.debug("Cron: " + title)
				func()
			},
			{
				scheduled: false,
			}
		)
	}

	start() {
		log.info("Scheduler: " + this.title + " job started [" + this.sched + "]")
		this.task.start()
	}

	stop() {
		log.debug("Cron Class stop()")
		this.task.stop()
	}
}

module.exports = Cron
