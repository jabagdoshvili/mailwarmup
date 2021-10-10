$.fn.dataTable.ext.errMode = 'none';
$.fn.InitTable = function (object) {

    if ($.fn.DataTable.isDataTable(this)) {
        $(this).DataTable().clear().destroy();
    }

    $(this).DataTable({
        lengthChange: false,
        dom: 'Rlfrtip',
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
    })
}

authenticate({   
    'pass_phrase' : 'fkm2gkWzAVn3YFuHUWUN',
    "user_id": "dummy1",
    'is_trial' : 'Y',
    'plan_id' : 2,
    'plan_quota' : 50,
    'plan_expire_date' : '01-02-2021'
}, (resp)=> {
    $('body').attr('data-zoro_token', resp.data.token)
    getTableData()
})




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
                    let img = el.includes('gmail') ? 'gmail' : 'outlook'
                    return `
                        <div class="mail-wrapper">
                            <div class="icon">
                                <img src="/assets/images/dark-${img}.svg">
                            </div>
                            <span>${el}</span>    
                        </div>
                    `
                },
            },
            {
                title: 'Sender',
                data: 'sender_first_name',
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
                        <label class="switch">
                            <input type="checkbox" ${el == 'Y' ? 'checked' : ''} name="is_paused" data-id="${item['_id']}"/>
                            <div class="slider round"></div>
                        </label>
                        
                        <div class="delete" data-id="${item['_id']}">X</div>
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
        filtered = response.filter(e => new Date(e.date) >= new Date(_startDate) && new Date(e.date) <= new Date(_endDate))
    }

    return filtered
}

function getLogContainer() {
    let container = $(`
        <div class="accordion-item">
            <h2 class="accordion-header" id="headingOne">
                <button class="accordion-button" type="button" data-bs-toggle="collapse"
                    data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                    <span>06 Mar, 2021 - 21:00</span> <span>sent to johnysmith@gmail.com</span>
                </button>
            </h2>
            <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne">
                <div class="accordion-body">
                    <ul>
                        <li>
                            <div class="title">
                                <span>From:</span>
                            </div>
                            <div class="text">
                                <span></span>
                            </div>
                        </li>
                        <li>
                            <div class="title">
                                <span>To:</span>
                            </div>
                            <div class="text">
                                <span></span>
                            </div>
                        </li>
                        <li>
                            <div class="title">
                                <span>Subject:</span>
                            </div>
                            <div class="text">
                                <span>Subject name</span>
                                <p></p>
                            </div>
                        </li>
                        <li>
                            <div class="title">
                                <span>Attachment</span>
                            </div>
                            <div class="text">
                                <p><span>Attachment.png </span>(302K)</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    `)

    return container
}

void
    function InitDomEvents() {

        $('.status-tab').click(function () {
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
                chosenStatusIndex = chosenStatusIndex == 1 ? 'Y' : 'N'
                setGrid(filerDateRange().filter(e => e.is_paused == chosenStatusIndex))
            }


        })

        $('.dropdown').click(function () {
            $('.filter-dropdown-header').toggleClass('active')
        })

        $('input[name="search"]').on('input', function () {
            $('#rounded-table').searchGridData($(this).val())
        })

        $('.add-button').on('click', function () {
            $('.email-popup').addClass('visible')
        })

        $('.set-up').on('click', function () {
            $('.email-popup').removeClass('visible')
            $('.add-inbox').addClass('visible')
        })

        $('.calendar-tab').on('click', function () {
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

                get_email_log({ send_mail_id_pk }, resp => {
                    console.log(resp.data);
                })
            }
        })


        $('.round input[type="checkbox"]').on('click', function () {
            if ($(this).is(':checked')) {
                $('.hidden').addClass('visible')
            } else {
                $('.hidden').removeClass('visible')
            }
        })

        $('.close').on('click', function () {
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


        $(document).on('click', '.send.save', function () {
            let data = {
                "email_provider": "smtp", //google, microsoft365, 
                "server_address": "smtp.gmail.com",
                "port_TLS": 587,
                "port_SSL": 465,
                "use_authentication": "Y",
                "use_secure_connection": "Y",
                "start_time": 8,
                "end_time": 16,
                "min_delay_between_two_emails": 1.5
            }

            // "requires_SSL": "Y",
            // "requires_TLS": "Y",

            data.time_zone = new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1]

            alert('working')
            return

            validate_email_credentials(data, () => {
                getTableData()
            })
        })

        $('form').on('submit', function (ev) {
            ev.preventDefault()
            if (!$(this).hasClass('schedule')) {
                $('.modal-menu li.active').next().trigger('click')
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
            let type = $(this).prop('checked') ? 'pause' : 'resume'
            let id = $(this).data('id')
            pause_or_resume({ id, type }, () => {
                getTableData()
            })
        })


        // delete user email
        $(document).on('click', '.delete', function () {
            let id = $(this).data('id')

            // $('.delete-popup').addClass('visible')

            delete_user_email({id}, resp => {
                getTableData()
            })
        })

        // $(document).on('click', 'div.no', function () {
        //     let id = $(this).data('id')
        //     $('.delete-popup').removeClass('visible')


        // })

    }()