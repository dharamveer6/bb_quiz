const {moment}=require("./timezone.js")

function increaseTime(sch_time, interval) {
    switch (interval) {
        case '5 mins':
            return moment(sch_time).add(5, 'minutes').valueOf();
        case '15 mins':
            return moment(sch_time).add(15, 'minutes').valueOf();
        case '30 mins':
            return moment(sch_time).add(30, 'minutes').valueOf();
        case '45 mins':
            return moment(sch_time).add(45, 'minutes').valueOf();
        case '1 hrs':
            return moment(sch_time).add(1, 'hours').valueOf();
        case '2 hrs':
            return moment(sch_time).add(2, 'hours').valueOf();
        case '3 hrs':
            return moment(sch_time).add(3, 'hours').valueOf();
        case '6 hrs':
            return moment(sch_time).add(6, 'hours').valueOf();
        case '1 days':
            return moment(sch_time).add(1, 'days').valueOf();
        case '2 days':
            return moment(sch_time).add(2, 'days').valueOf();
        case '3 days':
            return moment(sch_time).add(3, 'days').valueOf();
        case '1 week':
            return moment(sch_time).add(1, 'weeks').valueOf();
        case '2 week':
            return moment(sch_time).add(2, 'weeks').valueOf();
        case '1 month':
            return moment(sch_time).add(1, 'months').valueOf();
        case '2 month':
            return moment(sch_time).add(2, 'months').valueOf();
        case '3 month':
            return moment(sch_time).add(3, 'months').valueOf();
        case '6 month':
            return moment(sch_time).add(6, 'months').valueOf();
        case '1 year':
            return moment(sch_time).add(1, 'years').valueOf();

    }
}

module.exports={increaseTime}

// Example usage:
