const isLocal = location.href.includes('localhost')

const URI = $('body').attr('data-zoro_api_path')
function ajax(method, url, params) {
    let token = $('body').attr('data-zoro_token')

    var config = {
        async: true,
        url: URI + url,
        type: method,
        data: params,

        headers: {
            contentType: "application/json",
        },
    }

    if(token) config.headers["Authorization"] = "Bearer " + token
    
    return $.ajax(config);
}


function authenticate(data, callback) {
    ajax("POST", `/authenticate`, data).then(result => callback && callback(result))
}


function get_all_user_emails(data, callback) {
    ajax("POST", `get_all_user_emails`, data).then(result => callback && callback(result))
}

function pause_or_resume(data, callback) {
    ajax("POST", `pause_or_resume`, data).then(result => callback && callback(result))
}

function delete_user_email(data, callback) {
    ajax("POST", `delete_user_email`, data).then(result => callback && callback(result))
}

function validate_email_credentials(data, callback) {
    ajax("POST", `validate_email_credentials`, data).done(result => callback && callback(result)).fail(result => callback && callback(JSON.parse(result.responseText)))
}

function get_email_log(data, callback) {
    ajax("POST", `get_email_log`, data).then(result => callback && callback(result))
}

function get_individual_email_log(data, callback) {
    ajax("POST", `get_individual_email_log`, data).then(result => callback && callback(result))
}

function add_email(data, callback) {
    ajax("POST", `add_email`, data).then(result => callback && callback(result))
}



$(document).ajaxError(function (err, jqXHR, settings, thrownError) {
    if ([401, 403].includes(jqXHR.status)) {
        setNotification('Session expired!')
        $('.alert').addClass('visible')
        setTimeout(() => {
            location.href = '/a/login'
        }, 3000);
    }

    if(jqXHR.status == 400) {
        $('.loader.visible').removeClass('visible')
    }
});

$(document).ajaxStart(function () { $('.loader').addClass('visible') });
$(document).ajaxComplete(function () {$('.loader').removeClass('visible')});

$(document).ajaxSuccess(function (err, jqXHR, settings, thrownError) {
    let isPost = ['POST'].includes(settings.type)
    if ((isPost && !settings.url.includes('authenticate')) && (isPost && !settings.url.includes('get')) && (isPost && !settings.url.includes('validate_email_credentials')) && (isPost && !settings.url.includes('add_email'))) {
        $('.alert').addClass('visible')
        setTimeout(() => {
            $('.alert').removeClass('visible')
        }, 2000);
    }
});


function setNotification(message = 'success') {
    $('.alert').html(message)
}
setNotification()