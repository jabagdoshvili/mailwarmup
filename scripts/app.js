const isLocal = location.href.includes('localhost')

const URI = 'https://dashapi.mailzoro.io/v1'
function ajax(method, url, params) {
    let token = localStorage.getItem('token')
    if(token && !url.includes('authenticate')) {
        // params['token'] = token
    }
    var config = {
        async: true,
        url: URI + url,
        type: method,
        data: params,

        headers: {
            contentType: "application/json",
        },
    }
    
    return $.ajax(config);
}


function authenticate(data, callback) {
    ajax("POST", `/authenticate`, data).then(result => callback && callback(result))
}

authenticate({   
    'pass_phrase' : 'fkm2gkWzAVn3YFuHUWUN',
    'user_id' : '5',
    'is_trial' : 'Y',
    'plan_id' : 2,
    'plan_quota' : 50,
    'plan_expire_date' : '01-02-2022'
}, (resp)=> {
    localStorage.setItem('token', resp.data.token)
    $('body').attr('data-zoro_token', resp.data.token)
})

function get_all_user_emails(data, callback) {
    ajax("POST", `/get_all_user_emails`, data).then(result => callback && callback(result))
}

function pause_or_resume(data, callback) {
    ajax("POST", `/pause_or_resume`, data).then(result => callback && callback(result))
}

function delete_user_email(data, callback) {
    ajax("POST", `/delete_user_email`, data).then(result => callback && callback(result))
}

function validate_email_credentials(data, callback) {
    ajax("POST", `/validate_email_credentials`, data).then(result => callback && callback(result))
}

function get_email_log(data, callback) {
    ajax("POST", `/get_email_log`, data).then(result => callback && callback(result))
}

function get_individual_email_log(data, callback) {
    ajax("POST", `/get_individual_email_log`, data).then(result => callback && callback(result))
}

function add_email(data, callback) {
    ajax("POST", `/add_email`, data).then(result => callback && callback(result))
}



$(document).ajaxError(function (err, jqXHR, settings, thrownError) {
    if ([401, 403].includes(jqXHR.status)) {

    }

    if(jqXHR.status == 400) {
        $('.loader.visible').removeClass('visible')
    }
});

$(document).ajaxStart(function () { $('.loader').addClass('visible') });
$(document).ajaxComplete(function () {$('.loader').removeClass('visible')});

$(document).ajaxSuccess(function (err, jqXHR, settings, thrownError) {
    if (['POST'].includes(settings.type) && !settings.url.includes('get')) {
        $('.alert').addClass('visible')
        setTimeout(() => {
            $('.alert').removeClass('visible')
        }, 1500);
    }
});