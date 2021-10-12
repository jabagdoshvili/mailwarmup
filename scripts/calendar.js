var dateObj = new Date()
var month = dateObj.getMonth() + 1
var year = dateObj.getFullYear()


let prefinedObj = {
    'Yesterday': (date)=> date.setDate(date.getDate()-1),
    'Last week': (date)=> date.setDate(date.getDate()-7),
    'Last month': (date)=> date.setMonth(date.getMonth()-1),
    'Last year': (date)=> date.setFullYear(date.getFullYear()-1)
}


var currentMonthName = ''

var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function GetDateStr (date, format = 'MM/dd/yyyy') {
    if (!(date instanceof Date)) {
        date = this.GetStandartString(date)
        date = new Date(date)
    }
    if (date === 'Invalid Date') return

    var days = ('0' + date.getDate()).slice(-2),
        month = ('0' + (date.getMonth() + 1)).slice(-2),
        year = date.getFullYear(),

        hours  = ('0' + date.getHours()).slice(-2),
        minutes  = ('0' + date.getMinutes()).slice(-2),
        seconds  = ('0' + date.getSeconds()).slice(-2)

    if (~format.indexOf('hh')) hours = (hours + 1) % 12

    return format.replace('yyyy', year).replace('yy', String(year).slice(-2))
                 .replace('MM', month).replace('dd', days)
                 .replace('HH', hours).replace('hh', hours)
                 .replace('mm', minutes).replace('ss', seconds)
}


let _startDate = ''
let _endDate = ''

void
    function InitCalendar() {
        var customCalendar = $('.calendar-wrapper')

        let calendar = (`
        <div class="calendar">
            <div class="head">
                <div class="current">
                    <div class="arrow arrow-left"><img src="assets/images/arrow.svg"></div>
                    <div class="current-date">
                        <span class="current-month"></span>, <span class="current-year"></span>
                    </div>
                    <div class="arrow arrow-right"><img src="assets/images/arrow.svg"></div>
                </div>
                <ul class="date"></ul>
            </div>
            <ul class="month"></ul>
        </div>
    `)

        for (let i = 0; i < 2; i++) customCalendar.append(calendar)

        setPrefinedPeriod()
        setDays()

        function getDaysInMonth(m, y) {
            return new Date(y, m, 0).getDate();
        };


        function setDays() {
            days.forEach(el => $(`ul.date`, customCalendar).append(`<li class="date">${el.substring(0, 3)}</li>`))
        }


        function setPrefinedPeriod() {
            let prefinedPeriod = $(`
                <div class="predefined-periods">
                    <p>Predefined periods:</p>
                    <ul></ul>
                    <div class="selected">Selected: <span class="count">0</span> <span>days</span></div>
                    <div class="reset">Reset</div>
                </div>
            `)

            let periodName = ''
            Object.keys(prefinedObj).forEach(period => periodName += `<li>${period}</li>`)
            $('ul', prefinedPeriod).html(periodName)

            customCalendar.append(prefinedPeriod)
        }

        function getDays(currentYear, currentMonth, eq) {
            if (eq == 1 && currentMonth == 13) currentYear += 1
            var countDays = getDaysInMonth(currentMonth, currentYear)

            var prevMonthDays = getDaysInMonth(currentMonth - 1, currentYear)


            var indexOfFirstDay = new Date(currentYear, currentMonth - 1, 1).getDay() - 1
            if (days[0].charAt(0) == 'M') indexOfFirstDay -= 1;


            var li = ''
            for (var lastMonthDays = prevMonthDays - indexOfFirstDay; lastMonthDays <= prevMonthDays; lastMonthDays++) li += `<li class="empty"></li>`

            for (var i = 1; i <= countDays; i++) {
                li += `<li class="" data-date="${Math.abs(currentMonth % 13) || 1}/${i}/${currentYear}"><div class="date">${i}</div></li>`
                // ${dateObj.getDate() == i && dateObj.getMonth() + 1 == month && dateObj.getFullYear() == year ? 'today' : ''}
            }

            for (var i = 1; i < 42 - countDays - indexOfFirstDay; i++) li += `<li class="empty"></li>`


            currentMonthName = new Date(currentYear, currentMonth, 0).toLocaleDateString("default", {
                month: "long"
            })


            $(`.calendar:eq(${eq}) .current-month`, customCalendar).html(currentMonthName)
            $(`.calendar:eq(${eq}) .current-year`, customCalendar).html(currentYear)

            $(`.calendar:eq(${eq}) ul.month`, customCalendar).html(li)


            $(`.calendar:eq(${eq}) ul.month li`, customCalendar)

            $('[name="date"]').val(_startDate + '-' + _endDate);

            setInRange(eq)
        }

        function setInRange(eq) {
            if (new Date(_startDate) <= new Date(_endDate)) {
                const dates = getDates(new Date(_startDate), new Date(_endDate))
                dates.forEach((date, i) => {
                    let year = date.getFullYear()
                    let month = date.getMonth() + 1
                    let day = date.getDate()

                    const calendar = $(`.calendar:eq(${eq}) ul.month li[data-date="${month + '/' + day + '/' + year}"]`, customCalendar)

                    if (i == 0) calendar.addClass('start-date')
                    if (i == dates.length - 1) calendar.addClass('end-date')
                    
                    calendar.addClass('in-range')
                })
                $('[name="date"]').val(_startDate + '-' + _endDate);
                $('.count').text(getNumberOfDays(_startDate, _endDate))
            } else {
                $('[name="date"]').val('');
                $('.month li:not(.empty)').attr('class', '')

                if(eq == 1) {
                    setTimeout(() => {
                        $('.month li.active').trigger('click')
                    }, 0);
                }
            }
        }

        function getDates(startDate, endDate) {
            const dates = []
            let currentDate = startDate
            const addDays = function (days) {
                const date = new Date(this.valueOf())
                date.setDate(date.getDate() + days)
                return date
            }
            while (currentDate <= endDate) {
                dates.push(currentDate)
                currentDate = addDays.call(currentDate, 1)
            }
            return dates
        }


        getDays(year, month, 0)
        getDays(year, month + 1, 1)


        function getNumberOfDays(start, end) {
            const date1 = new Date(start);
            const date2 = new Date(end);
            const oneDay = 1000 * 60 * 60 * 24;
            const diffInTime = date2.getTime() - date1.getTime();
            const diffInDays = Math.round(diffInTime / oneDay);

            return diffInDays;
        }


        void function InitCalendarDomEvents() {

            $('.predefined-periods .reset').click(function () {
                _startDate = ''
                _endDate = ''
                hasStartDate = false
                hasEndDate = false

                $('.count').text(0)
                getDays(dateObj.getFullYear(), dateObj.getMonth(), 0)
                getDays(dateObj.getFullYear(), dateObj.getMonth() + 1, 1)
                setGrid(response)

                $('.predefined-periods ul li').removeClass('active')
            })


            $(customCalendar).on('click', '.arrow', function (ev) {
                var isLeft = $(this).hasClass('arrow-left')
                month = isLeft ? month -= 1 : month += 1

                if (month == 0) year -= 1, month = 12;
                else if (month > 12) month = 1, year += 1;

                getDays(year, month, 0)
                getDays(year, month + 1, 1)
            })

            let hasStartDate = false
            let hasEndDate = false

            $(customCalendar).on('click', '.month li:not(.empty)', function (e) {
                if (_startDate && _endDate) {
                    _startDate = ''
                    _endDate = ''
                    hasStartDate = false
                    hasEndDate = false
                    $('.month li:not(.empty)').attr('class', '')
                    $(this).addClass('active')
                }
                $('.predefined-periods li').removeClass('active')

                if (month == 13) year += 1

                if ($(this).closest('.calendar').index() == 1) month = Math.abs(month + 1 % 12)

                if (hasEndDate) $('.month li:not(.empty)').attr('class', '')

                if (!hasEndDate && !hasStartDate) {
                    _startDate = $(this).data('date')
                    hasStartDate = true

                    $('.count').text(0)
                } else {
                    _endDate = $(this).data('date')
                    hasEndDate = true
                    
                    setInRange(0)
                    setInRange(1)
                    
                    setGrid(filerDateRange())
                    $('.filter-dropdown li.active').click()
                }

                $(this).addClass('active')
            })

            $(customCalendar).on('click', '.predefined-periods li', function() {
                $(this).addClass('active').siblings().removeClass('active')
                let thisText = $(this).text()
                $('.month li:not(.empty)').attr('class', '')
                _startDate = GetDateStr(new Date(prefinedObj[thisText](new Date())))
                _endDate = GetDateStr(new Date())

                $('.calendar-wrapper').removeClass('visible')

                setInRange(0)
                setInRange(1)
                setGrid(filerDateRange())

            })
        }()
    }()