var video_start_time = 0;
var video_end_time = 0;
var end_action = "UNSTARTED";
var total_play_time = 0;
var windowWidth = 0;
var windowHeight = 0;
var bodyHeight = 0;
var aspectRatio;

window.fbAsyncInit = function () {
    FB.init({
        appId: "131285656905938",
        cookie: true,
        xfbml: true,
        version: "v2.5"
    });

    // Get Embedded Video Player API Instance
    var my_video_player;
    FB.Event.subscribe('xfbml.ready', function (msg) {
        if (msg.type === 'video') {
            my_video_player = msg.instance;
            my_video_player.play();

            my_video_player.subscribe('startedPlaying', function (e) {
                if (video_start_time === 0) {
                    video_start_time = new Date().getTime();
                    //console.log("startedPlaying at " + my_video_player.getCurrentPosition());
                    window.external.notify("fbevent:playing|Time#0");

                    var videoWidth = $('.fb-video').width();
                    var videoHeight = $('.fb-video').height();
                    aspectRatio = videoHeight / videoWidth;
                    //console.log("Aspect ratio is " + aspectRatio);

                    checkAndSetVideoWidth();

                } else {
                    if (end_action.localeCompare("PAUSED") == 0) {
                        //console.log("startedPlaying at " + my_video_player.getCurrentPosition());
                        window.external.notify("fbevent:playing|Time#"+my_video_player.getCurrentPosition());
                    }

                    video_end_time = new Date().getTime();

                    var interval = video_end_time - video_start_time;
                    total_play_time = total_play_time + Math.floor(interval);
                    //console.log("Total Played time set to: " + total_play_time);
                    resetVideoTimes();
                    video_start_time = new Date().getTime();
                }

                end_action = "PLAYING";
            });

            my_video_player.subscribe('paused', function (e) {
                end_action = "PAUSED";
                video_end_time = new Date().getTime();

                var interval = video_end_time - video_start_time;
                total_play_time = total_play_time + Math.floor(interval);

                //console.log("Total Played time is: " + total_play_time + " at " + my_video_player.getCurrentPosition());
                window.external.notify("fbevent:paused|TotalTime#"+total_play_time+"|at#"+my_video_player.getCurrentPosition());

                resetAllTimings();
            });

            my_video_player.subscribe('finishedPlaying', function (e) {
                video_end_time = new Date().getTime();
                end_action = "COMPLETED";

                var interval = video_end_time - video_start_time;
                total_play_time = total_play_time + Math.floor(interval);

                //console.log("FinishedPlaying with total_play_time is " + total_play_time + " at " + my_video_player.getCurrentPosition());
                window.external.notify("fbevent:ended|TotalTime#"+total_play_time+"|at#"+my_video_player.getCurrentPosition());

                resetAllTimings();
            });

            my_video_player.subscribe('error', function (e) {
                //console.log("error");

                if (end_action.localeCompare("UNSTARTED") !== 0) {
                    video_end_time = new Date().getTime();
                    var interval = video_end_time - video_start_time;
                    total_play_time = total_play_time + Math.floor(interval);
                }

                end_action = "ERROR";
                window.external.notify("fbevent:errorOccured|TotalTime#"+total_play_time);
            });

            my_video_player.subscribe('startedBuffering', function (e) {
                //console.log("startedBuffering at "+my_video_player.getCurrentPosition());
            });

            my_video_player.subscribe('finishedBuffering', function (e) {
                //console.log("finishedBuffering at "+my_video_player.getCurrentPosition());
            });
        }
    });

};

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "http://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function resetAllTimings() {
    video_start_time = 0;
    video_end_time = 0;
    total_play_time = 0;
}

function resetVideoTimes() {
    video_start_time = 0;
    video_end_time = 0;
}

function checkAndSetVideoWidth() {
    windowWidth = $(window).width();
    windowHeight = $(window).height();

    var fbVideoHeight = $('.fb-video').height();
    var fbVideoWidth = $('.fb-video').width();

    if (fbVideoHeight >= windowHeight) {
        var calWidth = windowHeight / aspectRatio;
        $('body').css('width', calWidth);
        //console.log("Width Changed due to height issue");
    } else if (fbVideoWidth >= windowWidth) {
        $('body').css('width', windowWidth);
        //console.log("Width Changed due to width issue");
    } else {
        var calWidth = windowHeight / aspectRatio;
        $('body').css('width', calWidth);
        //console.log("Width Changed.");
    }

    //console.log("fbVideoHeight is: " + fbVideoHeight + " windowHeight is " + windowHeight);
    //console.log("fbVideoWidth is: " + fbVideoWidth + " windowWidth is " + windowWidth);
}

$(window).resize(function () {
    checkAndSetVideoWidth();
});
