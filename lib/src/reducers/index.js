var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { analyzeMovesBase, getMoveObjects, getDepots, calcLoopTime } from '../library';
import { reducerWithInitialState } from "typescript-fsa-reducers";
import { addMinutes, setViewport, setDefaultViewport, setTimeStamp, setTime, increaseTime, decreaseTime, setLeading, setTrailing, setFrameTimestamp, setMovesBase, setDepotsBase, setAnimatePause, setAnimateReverse, setSecPerHour, setClicked, setRoutePaths, setDefaultPitch, setMovesOptionFunc, setDepotsOptionFunc, setLinemapData, setLoading, setInputFilename, updateMovesBase, setNoLoop, setInitialViewChange, setIconGradationChange } from '../actions';
var initialState = {
    viewport: {
        longitude: 136.906428,
        latitude: 35.181453,
        zoom: 11.1,
        maxZoom: 18,
        minZoom: 5,
        pitch: 30,
        bearing: 0,
        maxPitch: undefined,
        minPitch: undefined,
        width: window.innerWidth,
        height: window.innerHeight,
        transitionDuration: undefined,
        transitionInterpolator: undefined,
        transitionInterruption: undefined,
    },
    settime: 0,
    starttimestamp: 0,
    timeLength: 0,
    timeBegin: 0,
    loopTime: 0,
    leading: 100,
    trailing: 180,
    beforeFrameTimestamp: 0,
    movesbase: [],
    depotsBase: [],
    bounds: {
        westlongitiude: 0,
        eastlongitiude: 0,
        southlatitude: 0,
        northlatitude: 0
    },
    animatePause: false,
    loopEndPause: false,
    animateReverse: false,
    secperhour: 180,
    clickedObject: null,
    routePaths: [],
    defaultZoom: 11.1,
    defaultPitch: 30,
    getMovesOptionFunc: null,
    getDepotsOptionFunc: null,
    movedData: [],
    depotsData: [],
    linemapData: [],
    loading: false,
    inputFileName: {},
    noLoop: false,
    initialViewChange: true,
    iconGradation: false
};
var reducer = reducerWithInitialState(initialState);
reducer.case(addMinutes, function (state, min) {
    var assignData = {};
    assignData.loopEndPause = false;
    assignData.settime = state.settime + (min * 60);
    if (assignData.settime < (state.timeBegin - state.leading)) {
        assignData.settime = (state.timeBegin - state.leading);
    }
    if (assignData.settime > (state.timeBegin + state.timeLength)) {
        assignData.settime = (state.timeBegin + state.timeLength);
    }
    assignData.starttimestamp = Date.now() -
        (((assignData.settime - state.timeBegin) / state.timeLength) * state.loopTime);
    return Object.assign({}, state, assignData);
});
reducer.case(setViewport, function (state, view) {
    var viewport = Object.assign({}, state.viewport, view);
    return Object.assign({}, state, {
        viewport: viewport
    });
});
reducer.case(setDefaultViewport, function (state, defViewport) {
    if (defViewport === void 0) { defViewport = {}; }
    var defaultZoom = defViewport.defaultZoom, defaultPitch = defViewport.defaultPitch;
    var zoom = defaultZoom || state.defaultZoom;
    var pitch = defaultPitch || state.defaultPitch;
    var viewport = Object.assign({}, state.viewport, { bearing: 0, zoom: zoom, pitch: pitch });
    return Object.assign({}, state, {
        viewport: viewport,
        defaultZoom: zoom, defaultPitch: pitch
    });
});
reducer.case(setTimeStamp, function (state, props) {
    var starttimestamp = (Date.now() + calcLoopTime(state.leading, state.secperhour));
    return Object.assign({}, state, {
        starttimestamp: starttimestamp,
        loopEndPause: false
    });
});
reducer.case(setTime, function (state, settime) {
    var starttimestamp = Date.now() - (((settime - state.timeBegin) / state.timeLength) * state.loopTime);
    return Object.assign({}, state, {
        settime: settime, starttimestamp: starttimestamp,
        loopEndPause: false
    });
});
reducer.case(increaseTime, function (state, props) {
    var assignData = {};
    var beforeSettime = state.settime;
    var now = Date.now();
    if ((now - state.starttimestamp) >= state.loopTime) {
        if (!state.noLoop) {
            console.log('settime overlap.');
            assignData.settime = (state.timeBegin - state.leading);
            assignData.starttimestamp = now - (((assignData.settime - state.timeBegin) / state.timeLength) * state.loopTime);
            var setProps_1 = __assign(__assign({}, props), assignData);
            assignData.movedData = getMoveObjects(setProps_1);
            if (state.depotsBase.length <= 0 || state.depotsData.length <= 0 || state.getDepotsOptionFunc) {
                assignData.depotsData = getDepots(setProps_1);
            }
            return Object.assign({}, state, assignData);
        }
        else {
            return Object.assign({}, state, { loopEndPause: true });
        }
    }
    else {
        assignData.settime = ((((now - state.starttimestamp) % state.loopTime) /
            state.loopTime) * state.timeLength) + state.timeBegin;
    }
    if (beforeSettime > assignData.settime) {
        console.log(beforeSettime + " " + assignData.settime);
    }
    assignData.beforeFrameTimestamp = now;
    var setProps = __assign(__assign({}, props), assignData);
    assignData.movedData = getMoveObjects(setProps);
    if (state.depotsBase.length <= 0 || state.depotsData.length <= 0 || state.getDepotsOptionFunc) {
        assignData.depotsData = getDepots(setProps);
    }
    return Object.assign({}, state, assignData);
});
reducer.case(decreaseTime, function (state, props) {
    var now = Date.now();
    var beforeFrameElapsed = now - state.beforeFrameTimestamp;
    var assignData = {};
    assignData.starttimestamp = state.starttimestamp + (beforeFrameElapsed * 2);
    assignData.settime = ((((now - state.starttimestamp) % state.loopTime) /
        state.loopTime) * state.timeLength) + state.timeBegin;
    if (assignData.settime <= (state.timeBegin - state.leading)) {
        if (state.noLoop) {
            return Object.assign({}, state, { loopEndPause: true });
        }
        assignData.settime = state.timeBegin + state.timeLength;
        assignData.starttimestamp = now - (((assignData.settime - state.timeBegin) / state.timeLength) * state.loopTime);
    }
    assignData.beforeFrameTimestamp = now;
    var setProps = __assign(__assign({}, props), assignData);
    assignData.movedData = getMoveObjects(setProps);
    if (state.depotsBase.length <= 0 || state.depotsData.length <= 0 || state.getDepotsOptionFunc) {
        assignData.depotsData = getDepots(setProps);
    }
    return Object.assign({}, state, assignData);
});
reducer.case(setLeading, function (state, leading) {
    return Object.assign({}, state, {
        leading: leading
    });
});
reducer.case(setTrailing, function (state, trailing) {
    return Object.assign({}, state, {
        trailing: trailing
    });
});
reducer.case(setFrameTimestamp, function (state, props) {
    var assignData = {};
    var now = Date.now();
    assignData.beforeFrameTimestamp = now;
    assignData.starttimestamp = now - (((state.settime - state.timeBegin) / state.timeLength) * state.loopTime);
    var setProps = __assign(__assign({}, props), assignData);
    assignData.movedData = getMoveObjects(setProps);
    if (state.depotsBase.length <= 0 || state.depotsData.length <= 0 || state.getDepotsOptionFunc) {
        assignData.depotsData = getDepots(setProps);
    }
    return Object.assign({}, state, assignData);
});
reducer.case(setMovesBase, function (state, base) {
    var analyzeData = analyzeMovesBase(base);
    var assignData = {};
    assignData.loopEndPause = false;
    assignData.timeBegin = analyzeData.timeBegin;
    assignData.bounds = analyzeData.bounds;
    if (state.initialViewChange && analyzeData.movesbase.length > 0) {
        assignData.viewport = Object.assign({}, state.viewport, { bearing: 0, zoom: state.defaultZoom, pitch: state.defaultPitch }, analyzeData.viewport);
    }
    assignData.settime =
        analyzeData.timeBegin - (analyzeData.movesbase.length === 0 ? 0 : state.leading);
    if (analyzeData.timeLength > 0) {
        assignData.timeLength = analyzeData.timeLength + state.trailing;
    }
    else {
        assignData.timeLength = analyzeData.timeLength;
    }
    assignData.loopTime = calcLoopTime(assignData.timeLength, state.secperhour);
    // starttimestampはDate.now()の値でいいが、スタート時はleading分の余白時間を付加する
    assignData.starttimestamp = Date.now() + calcLoopTime(state.leading, state.secperhour);
    if (state.depotsBase.length <= 0 || state.depotsData.length <= 0 || state.getDepotsOptionFunc) {
        assignData.depotsData = getDepots(__assign(__assign({}, state), { bounds: analyzeData.bounds }));
    }
    assignData.movesbase = analyzeData.movesbase;
    assignData.movedData = [];
    return Object.assign({}, state, assignData);
});
reducer.case(setDepotsBase, function (state, depotsBase) {
    var assignData = {};
    assignData.depotsBase = depotsBase;
    if (state.depotsBase.length <= 0 || state.depotsData.length <= 0 || state.getDepotsOptionFunc) {
        assignData.depotsData = getDepots(__assign(__assign({}, state), { depotsBase: depotsBase }));
    }
    return Object.assign({}, state, assignData);
});
reducer.case(setAnimatePause, function (state, animatePause) {
    var assignData = {};
    assignData.animatePause = animatePause;
    assignData.loopEndPause = false;
    assignData.starttimestamp = (Date.now() - (((state.settime - state.timeBegin) / state.timeLength) * state.loopTime));
    return Object.assign({}, state, assignData);
});
reducer.case(setAnimateReverse, function (state, animateReverse) {
    return Object.assign({}, state, {
        animateReverse: animateReverse,
        loopEndPause: false
    });
});
reducer.case(setSecPerHour, function (state, secperhour) {
    var assignData = {};
    assignData.loopEndPause = false;
    assignData.secperhour = secperhour;
    assignData.loopTime = calcLoopTime(state.timeLength, secperhour);
    if (!state.animatePause) {
        assignData.starttimestamp =
            (Date.now() - (((state.settime - state.timeBegin) / state.timeLength) * assignData.loopTime));
    }
    return Object.assign({}, state, assignData);
});
reducer.case(setClicked, function (state, clickedObject) {
    return Object.assign({}, state, {
        clickedObject: clickedObject
    });
});
reducer.case(setRoutePaths, function (state, routePaths) {
    return Object.assign({}, state, {
        routePaths: routePaths
    });
});
reducer.case(setDefaultPitch, function (state, defaultPitch) {
    return Object.assign({}, state, {
        defaultPitch: defaultPitch
    });
});
reducer.case(setMovesOptionFunc, function (state, getMovesOptionFunc) {
    return Object.assign({}, state, {
        getMovesOptionFunc: getMovesOptionFunc
    });
});
reducer.case(setDepotsOptionFunc, function (state, getDepotsOptionFunc) {
    return Object.assign({}, state, {
        getDepotsOptionFunc: getDepotsOptionFunc
    });
});
reducer.case(setLinemapData, function (state, linemapData) {
    return Object.assign({}, state, {
        linemapData: linemapData
    });
});
reducer.case(setLoading, function (state, loading) {
    return Object.assign({}, state, {
        loading: loading
    });
});
reducer.case(setInputFilename, function (state, fileName) {
    var inputFileName = Object.assign({}, state.inputFileName, fileName);
    return Object.assign({}, state, {
        inputFileName: inputFileName
    });
});
reducer.case(updateMovesBase, function (state, base) {
    var analyzeData = analyzeMovesBase(base);
    var assignData = {};
    assignData.loopEndPause = false;
    if (state.movesbase.length === 0 || analyzeData.timeLength === 0) { //初回？
        assignData.timeBegin = analyzeData.timeBegin;
        assignData.timeLength = analyzeData.timeLength;
        assignData.bounds = analyzeData.bounds;
        assignData.movesbase = analyzeData.movesbase;
        assignData.movedData = [];
        assignData.settime = analyzeData.timeBegin - state.leading;
        if (assignData.timeLength > 0) {
            assignData.timeLength = assignData.timeLength + state.trailing;
        }
        assignData.loopTime = calcLoopTime(assignData.timeLength, state.secperhour);
        // starttimestampはDate.now()の値でいいが、スタート時はleading分の余白時間を付加する
        assignData.starttimestamp = Date.now() + calcLoopTime(state.leading, state.secperhour);
        if (state.initialViewChange && analyzeData.movesbase.length > 0) {
            assignData.viewport = Object.assign({}, state.viewport, { bearing: 0, zoom: state.defaultZoom, pitch: state.defaultPitch }, analyzeData.viewport);
        }
        if (state.depotsBase.length <= 0 || state.depotsData.length <= 0 || state.getDepotsOptionFunc) {
            assignData.depotsData = getDepots(__assign(__assign({}, state), assignData));
        }
        return Object.assign({}, state, assignData);
    }
    assignData.movesbase = analyzeData.movesbase;
    assignData.movedData = [];
    var startState = {};
    startState.timeLength = analyzeData.timeLength;
    if (startState.timeLength > 0) {
        startState.timeLength = startState.timeLength + state.trailing;
    }
    if (analyzeData.timeBegin !== state.timeBegin || startState.timeLength !== state.timeLength) {
        startState.timeBegin = analyzeData.timeBegin;
        startState.loopTime = calcLoopTime(startState.timeLength, state.secperhour);
        startState.starttimestamp =
            (Date.now() - (((state.settime - startState.timeBegin) / startState.timeLength) * startState.loopTime));
        return Object.assign({}, state, startState, assignData);
    }
    return Object.assign({}, state, assignData);
});
reducer.case(setNoLoop, function (state, noLoop) {
    return Object.assign({}, state, {
        noLoop: noLoop,
        loopEndPause: false
    });
});
reducer.case(setInitialViewChange, function (state, initialViewChange) {
    return Object.assign({}, state, {
        initialViewChange: initialViewChange
    });
});
reducer.case(setIconGradationChange, function (state, iconGradation) {
    return Object.assign({}, state, {
        iconGradation: iconGradation
    });
});
reducer.default(function (state) { return state; });
export default reducer.build();
//# sourceMappingURL=index.js.map