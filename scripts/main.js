$.fn.dataTable.ext.errMode = 'none';
$.fn.InitTable = function (object) {

    if ($.fn.DataTable.isDataTable(this)) {
        $(this).DataTable().clear().destroy();
    }

    $(this).DataTable({
        lengthChange: false,
        dom: 'Rlfrtip',
        "language": {
            "emptyTable":`<div class="no-data"><img src="./assets/images/noresult.png" alt=""> <span>No matching search results</span>  Try again using more general search terms</div>`,
            "zeroRecords": `<div class="no-data"><img src="./assets/images/noresult.png" alt=""> <span>No matching search results</span>  Try again using more general search terms</div>`,
        },
        order: [],
        responsive: true,
        "paging": true,
        "pageLength": 6,
        ...object,
    });
}

$.fn.searchGridData = function (text) {
    $(this).DataTable().search(text).draw();
}


let filterdByDate = false
let fileredByStatus = 0
let response = []
function getTableData() {
    get_all_user_emails({
        "order_by": "asc", //desc
        "current_results_from": "0",
        "current_results_to": "12"
    }, resp => {
        response = resp.data.emails
        setGrid(response)
        let q = resp.data.quota
        $('#quota').text(q['user-used-quota']+'/'+q['user-total-quota'])
    })
}

// authenticate({   
//     'pass_phrase' : 'fkm2gkWzAVn3YFuHUWUN',
//     "user_id": "dummy1",
//     'is_trial' : 'Y',
//     'plan_id' : 2,
//     'plan_quota' : 50,
//     'plan_expire_date' : '01-02-2021'
// }, (resp)=> {
//     $('body').attr('data-zoro_token', resp.data.token)
//     getTableData()
// })

getTableData()


function setGrid(data) {

    $('#rounded-table').InitTable({
        data: data,
        columns: [
            {
                title: 'Date',
                data: 'added_date',
            },
            {
                title: 'Email Address',
                data: 'email',
                render: function (el, type, item) {
                    return `
                        <div class="mail-wrapper">
                            <div class="icon">
                                <img src="./assets/images/dark-${item.email_provider}.svg">
                            </div>
                            <span>${el}</span>    
                        </div>
                    `
                },
            },
            {
                title: 'Sender',
                data: 'sender_first_name',
                render: function(el, type, item) {
                    return el + ' ' + item['sender_last_name']
                }
            },
            {
                title: 'Starting (Baseline)',
                data: 'starting_baseline',
            },
            {
                title: 'Increase (Per Day)',
                data: 'increase_per_day',
            },
            {
                title: 'Max Sends (Per Day)',
                data: 'max_sends_per_day',
            },
            {
                title: 'Replay Rate',
                data: 'reply_rate_%',
                render: function (el, type, item) {
                    return `<div class="rate">${el}%</div>`
                }
            },
            {
                title: 'Status',
                data: 'is_paused',
                render: function (el, type, item) {
                    return `                        
                        <div class="status-wrapper">
                            <label class="switch">
                                <input type="checkbox" ${el == 'N' ? 'checked' : ''} name="is_paused" data-id="${item['_id']}"/>
                                <div class="slider round"></div>
                            </label>
                            
                            <div class="delete" data-id="${item['_id']}">
                                <img src="./assets/images/menu-vertical.png" alt="">
                                <div class="sm-popup">
                                    <p>Delete</p>
                                </div>
                            </div>
                        </div>
                    `
                }
            },
        ],
        createdRow: function (row, data, dataIndex) {
            let id = data['_id']
            $(row).attr('data-id', id)
        },
    })
}


function filerDateRange() {
    let filtered = response
    if (_endDate != '' && _startDate != '') {
        filtered = response.filter(e => new Date(e.added_date.replace(/\-/g, '/')) >= new Date(_startDate) && new Date(e.added_date.replace(/\-/g, '/')) <= new Date(_endDate))
    }

    return filtered
}

function getLogContainer(log_id, date, description) {
    let randomStr = (Math.random() + 1).toString(36).substring(7)
    let container = $(`
        <div class="accordion-item" data-random="${randomStr}" log-id="${log_id}">
            <h2 class="accordion-header" id="headingOne">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${log_id}${randomStr}" aria-expanded="false" aria-controls="${log_id}${randomStr}">
                    <span>${date}</span> <span>${description}</span>
                </button>
            </h2>
        </div>
    `)

    return container
}


function getIndividualLogsContaner(id, randomString) {
    get_individual_email_log({log_id: id}, resp=> {
        let {body, from, subject, to, atachments} = resp.data

        let acordionItem = $(`.accordion-item[log-id="${id}"][data-random="${randomString}"]`)
        
         $(`h2.accordion-header`, acordionItem).after(`
            <div id="${id}${randomString}" class="accordion-collapse collapse" aria-labelledby="headingOne">
                <div class="accordion-body">
                    <ul>
                        <li>
                            <div class="title">
                                <span>From:</span>
                            </div>
                            <div class="text">
                                <span>${from}</span>
                            </div>
                        </li>
                        <li>
                            <div class="title">
                                <span>To:</span>
                            </div>
                            <div class="text">
                                <span>${to}</span>
                            </div>
                        </li>
                        <li>
                            <div class="title">
                                <span>Subject:</span>
                            </div>
                            <div class="text">
                                <span>${subject}</span>
                                <p>${body}</p>
                            </div>
                        </li>
                        <li>
                        ${atachments ?
                        `<div class="title">
                                <span>Attachment</span>
                            </div>
                            <div class="text">
                                <p><span>${atachments} </span>(Size)</p>
                            </div>` : ''}
                        </li>
                    </ul>
                </div>
            </div>
        `)
        $('button', acordionItem).click()
    })
}

void
    function InitDomEvents() {
        
        $('.modals').on('click', '.accordion-item:not(.clicked) h2.accordion-header', function() {
            let id = $(this).closest('.accordion-item').addClass('clicked').attr('log-id')
            let randomStr = $(this).closest('.accordion-item').data('random')
            getIndividualLogsContaner(id, randomStr)
        })

        $('.letters').keypress(function (e) {
            var regex = new RegExp(/^[a-zA-Z\s]+$/);
            var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
            if (regex.test(str)) {
                return true;
            }
            else {
                e.preventDefault();
                return false;
            }
        });

        $('.status-tab').click(function () {
            $('.popup-wrapper').removeClass('visible')
            $('.popup-wrapper').removeClass('active')
            $('.filter-dropdown').toggleClass('active')
            $('.filter-dropdown-header').removeClass('active')
        })

        $('.filter-dropdown li').click(function () {
            $('.status-tab span').text($(this).html())
            $('.filter-dropdown').removeClass('active')

            $(this).addClass('active').siblings().removeClass('active')

            let chosenStatusIndex = $(this).index()

            if (chosenStatusIndex == 0) setGrid(filerDateRange())
            else {
                chosenStatusIndex = chosenStatusIndex != 1 ? 'Y' : 'N'
                setGrid(filerDateRange().filter(e => e.is_paused == chosenStatusIndex))
            }


        })

        $('.dropdown').click(function () {
            $('.popup-wrapper').removeClass('visible')
            $('.popup-wrapper').removeClass('active')
            $('.filter-dropdown-header').toggleClass('active')
        })

        $('input[name="search"]').on('input', function () {
            $('#rounded-table').searchGridData($(this).val())
        })

        $('.add-button').on('click', function () {
            $('.email-popup').addClass('visible')
        })

        let hasProvider = false
        $('.set-up').on('click', function () {
            $('.email-popup').removeClass('visible')
            $('.add-inbox').addClass('visible')
            $('[tab="custom"]').show()
            $('.add-inbox .modal-menu ul li:eq(0)').click()
            $('li.action').hide()
            hasProvider = false
        })

        let email_provider = 'smtp'
        $('.contact-list').on('click', 'li', function() {
            email_provider = $(this).data('id')
            $('.email-popup').removeClass('visible')
            $('.add-inbox').addClass('visible')
            $('[tab="custom"]').hide()
            $('.add-inbox .modal-menu ul li:eq(0)').click()
            $('li.action').hide()
            hasProvider = true
        })

        $('.calendar-tab').on('click', function () {
            $('.popup-wrapper').removeClass('visible')
            $('.popup-wrapper').removeClass('active')
            $('.calendar-wrapper ').toggleClass('visible')
            $('.filter-dropdown').removeClass('visible')
        })

        $(document).on('click', 'tbody tr > td:not(:last-child)', function (e) {
            let send_mail_id_pk = $(this).closest('tr').data('id')
            var target = $(e.target);
            if (target.is('.round')) {
                $('.mail-inside').removeClass('visible')
            } else {
                $('.mail-inside').addClass('visible')
                $('.accordion').empty()
                get_email_log({ send_mail_id_pk }, resp => {
                    resp.data.log.forEach((el, i)=> {
                        let {log_id, date, description} = el
                        let logContainer = getLogContainer(log_id, date, description)
                        $('.accordion').append(logContainer)

                        if(i == resp.data.log.length - 1) $('.loader.visible').removeClass('visible')
                    })
                })
            }
        })

        $('')

        var number = $('form input[type="number"]')

        number.onkeydown = function(e) {
            if(!((e.keyCode > 95 && e.keyCode < 106 && e.keyCode == 190)
            || (e.keyCode > 47 && e.keyCode < 58) 
            || e.keyCode == 8)) {
                return false;
            }
        }


        $('.open-check input[type="checkbox"]').on('click', function () {
            if ($(this).is(':checked')) {
                $('.hidden').addClass('visible')
            } else {
                $('.hidden').removeClass('visible')
            }
        })

        $('.close').on('click', function () {
            $('form')[0].reset();
            $('.overflow').removeClass('visible')
        })

        $('.modal-menu ul li').on('click', function () {
            let atr = $(this).attr('tab')
            $(this).addClass('active').siblings().removeClass('active')
            $(`.${atr}`, '.modal-wrapper').addClass('active').siblings().removeClass('active')
            if (atr == 'schedule' && $(`.${atr}`, '.modal-wrapper').hasClass('active')) {
                $('.send').addClass('save').html('Save')
            } else {
                $('.send').removeClass('save').html('Proceed to Save')
            }
        })


        $('.modals').on('click', 'button.back', function (e) {
            e.preventDefault()
            $('[tab="authentication"]').click()
        })

        $('.modals').on('click', 'button.close', function (e) {
            $('form')[0].reset();            
            e.preventDefault()
            $(this).closest('.modals').find('close').click()
        })


        $('.modals').on('click', '.send.save', function (e) {

            let required = $('.modal-wrapper input').filter('[required]:visible');

            let allRequired = true;
            required.each(function(){
                if($(this).val() == ''){
                    allRequired = false;
                }
            });

            if(!allRequired){
                return
            }

            e.preventDefault()
            let data = {}
            let validatedata = {}

            $('.modal-wrapper .modal-form input').each((index, el)=> {
                let input = $(el)
                let key = input.attr('name')
                let type = input.attr('type')
                let noauth = input.attr('noauth')
                let val = ''
                if(type == 'checkbox') val = input.prop('checked') ? 'Y' : 'N'
                else val = input.val()

                if(val == '' || noauth == 'yes') return;
                validatedata[key] = val
            })

            $('.modal-wrapper .modal-form input').each((index, el)=> {
                let input = $(el)
                let key = input.attr('name')
                let type = input.attr('type')
                let val = ''
                if(type == 'checkbox') val = input.prop('checked') ? 'Y' : 'N'
                else val = input.val()

                if(val == '') return;
                data[key] = val
            })

            data.email_provider = email_provider
            validatedata.email_provider = email_provider


            // data.time_zone = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1]

            // let lastStep = ['starting_baseline','increase_per_day','max_sends_per_day','reply_rate_%']
            // let values = [] 
            // lastStep.forEach(el=> {
            //     values.push(data[el])
            // })

            validate_email_credentials(validatedata, (resp) => {
                let message = ''    
                resp.messages.forEach(msg=> {
                    message += msg+'<br/>'
                })
                if(resp.error == 'Y') {
                    $('.modal-form.error p').html(message)
                    $('[tab="error"]').css('display', 'flex').click()
                } else {
                    message = ''
                    add_email(data, (respo) => {
                        respo.messages.forEach(msgs=> {
                            message += msgs+'<br/>'
                        })
                        if(respo.error == 'Y') {
                            $('.modal-form.error p').html(message)
                            $('[tab="error"]').css('display', 'flex').click()
                        } else {
                            $('.modal-form.success p').html(message)
                            $('[tab="success"]').css('display', 'flex').click()
                        }
                    })
                }
            })
        })

        $('form').on('submit', function (ev) {
            ev.preventDefault()
            if($(ev.target).is('.back') || $(ev.target).is('.close')) return;
            if (!$(this).hasClass('schedule')) {
                let li = null
                if(hasProvider) {
                    li = $('.modal-menu li[tab="schedule"]:visible')
                } else {
                    li =  $('.modal-menu li.active + li:not(.action):visible')
                }
                li.trigger('click')
            }
        })

        $(document).on('click', function () {
            $('.filter-dropdown-header.active').removeClass('active')
        })

        $('.filter-dropdown-header, .dropdown').on('click', function (e) {
            e.stopPropagation()
        })

        $(document).on('click', function () {
            $('.filter-dropdown.active').removeClass('active')
        })

        $('.filter-dropdown, .status-tab').on('click', function (e) {
            e.stopPropagation()
        })

        $(document).on('click', function () {
            $('form')[0].reset();
            $('.overflow:not(.mail-inside).visible').removeClass('visible')
        })

        $('.modals, .add-button').on('click', function (e) {
            e.stopPropagation()
        })

        $('body').on('click', function (e) {
            if ($('.mail-inside').hasClass('visible')) {
                $('.mail-inside').removeClass('visible')
            }
        })

        $(document).on('click', function () {
            $('.calendar-wrapper.visible').removeClass('visible')
        })

        $('.calendar-wrapper, .calendar-tab').on('click', function (e) {
            e.stopPropagation()
        })


        $(document).on('change', 'input[name="is_paused"]', function () {
            let type = !$(this).prop('checked') ? 'pause' : 'resume'
            let id = $(this).data('id')
            pause_or_resume({ id, type }, () => {
                getTableData()
            })
        })

        // delete user email
        let id;
        $(document).on('click', '.delete', function () {
            id = $(this).data('id')

            $('.sm-popup').removeClass('active')
            $(this).find('.sm-popup').toggleClass('active')

        })

        $(document).on('click', '.sm-popup', function () {

            $('.sm-popup').removeClass('active')
            $('.flow').addClass('visible')

        })

        $('.delete-popup .modal-title .close').on('click', function () {
            $('form')[0].reset();
            $('.sm-popup').removeClass('active')
            $('.flow').removeClass('visible')
        })

        $('.delete-popup div.no').on('click', function () {
            $('.sm-popup').removeClass('active')
            $('.flow').removeClass('visible')
        })

        $('.accordion-modal .modal-menu ul li').on('click', function () {
            let tab = $(this).attr('tab')

            if(tab == 'analytics') {
                $('.analytics-area').addClass('visible').siblings().removeClass('visible')
            } else {
                $('.accordion-area').addClass('visible').siblings().removeClass('visible')
            }
        })

        $('.delete-popup div.yes').on('click', function () {
            
            $('.sm-popup').removeClass('active')
            $('.flow').removeClass('visible')

            delete_user_email({id}, resp => {
                getTableData()
            })
        })

    }()