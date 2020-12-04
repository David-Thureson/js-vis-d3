var animations = [];

var timers = [];

var busy = false;

function animationStart(timeSeconds, frameCount, minFrameMsec, callback) {
    let animIndex = animations.length;
    var timerDelayMsec = Math.max(minFrameMsec, Math.ceil((timeSeconds * 1000) / frameCount));
    animations.push({
        timeSeconds,
        frameCount,
        minFrameMsec,
        timerDelayMsec,
        timeStart: new Date().getTime(),
        prevFrameIndex: -1,
        skippedFrameCount: 0,
        callback,
    });
    busy = false;
    timers.push(d3.timer(function(duration) { animationTick(animIndex, duration) }, timerDelayMsec));
    return animIndex;
}

function animationTick(animIndex, duration) {

    // if (busy) {
    //     console.log("animationTick(): skipping because of busy");
    //     return;
    // }

    // console.log("animationTick(): busy = true");
    // busy = true;

    var anim = animations[animIndex];

    let elapsedFromStartMsec = new Date().getTime() - anim.timeStart;
    let elapsedPortion = Math.min(1.0, elapsedFromStartMsec / (anim.timeSeconds * 1000));
    var frameNumber = Math.floor(anim.frameCount * elapsedPortion);
    var frameIndex = frameNumber - 1;
    //onsole.log("frame_index = " + frame_index, "elapsed_from_start_msec = " + elapsed_from_start_msec, "elapsed_portion = " + elapsed_portion);

    if (frameIndex >= anim.frameCount - 1) {
        timers[animIndex].stop();
        //onsole.log("animationTick(): busy = false");
        //usy = false;
    }
    if (frameIndex > anim.prevFrameIndex && frameIndex < anim.frameCount) {
        let skippedFrames = (frameIndex - anim.prevFrameIndex) - 1;
        anim.skippedFrameCount += skippedFrames;

        /*
        if (skipped_frames > 0) {
            anim.current_timer_delay_msec *= 2;
            console.log("doubling anim.current_timer_delay_msec = " + anim.current_timer_delay_msec);
        } else {
            if (anim.current_timer_delay_msec > anim.timer_delay_msec) {
                anim.current_timer_delay_msec = Math.max(anim.timer_delay_msec, Math.ceil(anim.current_timer_delay_msec / 2));
                console.log("halving anim.current_timer_delay_msec = " + anim.current_timer_delay_msec);
            }
        }
        */

        anim.prevFrameIndex = frameIndex;
        if (frameIndex >= anim.frameCount -1) {
            console.log("frameIndex = " + frameIndex, "elapsedFromStartMsec = " + elapsedFromStartMsec, "elapsedPortion = " + elapsedPortion);
            console.log(anim);
        }
        // timers[anim_index].restart(function (duration) { animation_tick(anim_index, duration) }, anim.current_timer_delay_msec);
        // if (frame_index < anim.frame_count) {
        anim.callback(animIndex, frameIndex, anim.frameCount, anim.skippedFrameCount, elapsedFromStartMsec, elapsedPortion);
        // }
    }
}



