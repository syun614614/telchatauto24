// 現在のURLのクエリパラメータを取得
const params = new URLSearchParams(window.location.search);

// パラメータを取得
const paramValue = params.get('name');

let agentData = null; // グローバル変数を宣言
let webhookCalled = false; // Webhook呼び出し済みフラグ

// Webhookを呼び出す関数
async function fetchWebhookData() {
    try {
        const response = await fetch('https://hook.us2.make.com/b7lvzbakgdtl9x0pdfaaen0wmu8x68ff?name='+paramValue, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        agentData = await response.json(); // データをグローバル変数に保存
        console.log('取得したデータ:', agentData);
    } catch (error) {
        console.error('エラー:', error);
    }
}

const loadScriptAsync = (value) => {

    // callfluent_paper クラスの要素を削除
    const leftoverElements = document.querySelectorAll(".callfluent_paper");
    leftoverElements.forEach(element => {
        element.remove();
    });

    const target = agentData.find(item => item.properties.optionvalue.rich_text[0].plain_text === value);
    if (target) {
        initializeCallFluent(target.properties.agentid.rich_text[0].plain_text,
            target.properties.caption1.rich_text[0].plain_text,
            target.properties.caption2.rich_text[0].plain_text,
            target.properties.callable.rich_text[0].plain_text,
            target.properties.busy.rich_text[0].plain_text);
    }
};

// セレクトメニューの変更イベントにリスナーを追加
document.getElementById('languageSelect').addEventListener('click', (event) => {
    if (!webhookCalled) { // Webhookがまだ呼び出されていない場合のみ実行
        // データ取得後に利用
        fetchWebhookData().then(() => {
            // セレクトメニューを生成
            generateSelectMenu();
            webhookCalled = true; // フラグを設定して再度呼び出されないようにする
        });
    }
});

// セレクトメニューの変更イベントにリスナーを追加
document.getElementById('languageSelect').addEventListener('change', (event) => {
    const selectedValue = event.target.value; // 選択された値を取得

    if (webhookCalled) {
        loadScriptAsync(selectedValue);
    }
});

class PlayerPlaybackAudioBufferContext extends EventTarget {
    uniqueListners = {};
    constructor(t = null) {
        super(), this.audioContext = new(window.AudioContext || window.webkitAudioContext)({
            sampleRate: 24e3
        }), this.source = null, this.isOnPlay = !1, this.bufferChunks = [], this.started = !1, t && this.appendBuffer(t), this.onPlayStart = new CustomEvent("onPlayStart"), this.onPLayEnd = new CustomEvent("onPLayEnd"), this.onPlayBuffer = new CustomEvent("onPlayBuffer"), this.onPlayStop = new CustomEvent("onStop")
    }
    appendBuffer(t) {
        this.bufferChunks.push(t)
    }
    resetBuffer() {
        this.bufferChunks = [], this.bufferChunks.length = 0
    }
    getIsOnPlay() {
        return this.isOnPlay
    }
    concatArrayBuffers(t) {
        var e = t.reduce((t, e) => e && 0 < e.byteLength ? t + e.byteLength : t, 0);
        if (0 === e) throw new Error("All buffers are empty or invalid.");
        let n = new Uint8Array(e),
            a = 0;
        return t.forEach(t => {
            t && 0 < t.byteLength && (t = new Uint8Array(t), n.set(t, a), a += t.byteLength)
        }), n.buffer
    }
    async play() {
        try {
            var t;
            this.isOnPlay = !0, this.started || (this.started = !0, this.dispatchEvent(new CustomEvent("onPlayStart"))), 0 === this.bufferChunks.length ? (console.log("No Buffer", this.bufferChunks.length), this.isOnPlay = !1) : (this.source = this.audioContext.createBufferSource(), t = await this.audioContext.decodeAudioData(this.concatArrayBuffers(this.bufferChunks)), this.source.buffer = t, this.bufferChunks = [], this.bufferChunks.length = 0, this.source.connect(this.audioContext.destination), this.source.start(), this.dispatchEvent(new CustomEvent("onPlayBuffer", {
                detail: t
            })), this.source.onended = async () => {
                this.isOnPlay = !1, 0 < this.bufferChunks.length ? await this.play() : this.started ? (this.dispatchEvent(new CustomEvent("onPlayEnd")), this.started = !1) : setTimeout(() => {
                    this.dispatchEvent(new CustomEvent("onPlayEnd"))
                }, 200)
            })
        } catch (t) {
            console.error(t)
        }
    }
    stop() {
        if (this.source) {
            try {
                this?.source?.stop?.()
            } catch (t) {
                console.error(t)
            }
            this.dispatchEvent(this.onPlayStop)
        }
    }
    addOnceEventListner(t, e) {
        void 0 === this.uniqueListners[t] && (this.uniqueListners[t] = e, this.addEventListener(t, e))
    }
}
let Player = new PlayerPlaybackAudioBufferContext;
async function getMicrophone() {
    var t = await navigator.mediaDevices.getUserMedia({
        audio: !0
    });
    return new MediaRecorder(t)
}
async function openMicrophone(t) {
    await t.start(1e3), t.onstart = () => {
        console.log("client: microphone opened"), document.body.classList.add("recording")
    }, t.onstop = () => {
        console.log("client: microphone closed"), document.body.classList.remove("recording")
    }
}
async function closeMicrophone(t) {
    t.stop()
}
async function start() {
    let t;
    try {
        t ? (await closeMicrophone(t), t = void 0) : await openMicrophone(t = await getMicrophone())
    } catch (t) {
        console.error(t)
    }
    return t
}
let Microfone = {
    start: start,
    closeMicrophone: closeMicrophone,
    openMicrophone: openMicrophone
};
class InboundCall {
    constructor(t, e, n) {
        this.microphone = t, this.player = e, this.microfoneInstance = null, this.socketInstance = null, this.playBackAudio = null, this.callRingAudio = new Audio(n + "/audio/ring-tone.mp3"), this.hangUpCallAudio = new Audio(n + "/audio/call-hang-up.mp3")
    }
    async startMicrophone() {
        return this.microphone.start()
    }
    async startCallRingAudio() {
        try {
            await this.callRingAudio.play(), this.callRingAudio.loop = !0
        } catch (t) {
            console.log("ring-error".e)
        }
    }
    async startHangupAudio() {
        try {
            await this.hangUpCallAudio.play(), this.hangUpCallAudio.loop = !1
        } catch (t) {
            console.log("ring-error".e)
        }
    }
    delay(e) {
        return new Promise(t => setTimeout(t, e))
    }
    async start(e, n, a) {
        return await this.hangUpCall(!1), await this.startMicrophone().then(async t => {
            await this.startCallRingAudio(), this.microfoneInstance = t, this.socketInstance = new WebSocket(n + "/socket?callId=" + e), this.socketInstance.onopen = () => {
                this.player.addOnceEventListner("onPlayEnd", () => {
                    this.socketInstance.readyState === WebSocket.OPEN && this.socketInstance?.send?.(JSON.stringify({
                        event: "onPlayEnd"
                    }))
                }), this.player.addOnceEventListner("onPlayStart", () => {
                    this.socketInstance.readyState === WebSocket.OPEN && this.socketInstance?.send?.(JSON.stringify({
                        event: "onPlayStart"
                    }))
                }), this.socketInstance?.send?.(JSON.stringify({
                    event: "start",
                    callId: e
                })), this.socketInstance.onmessage = async ({
                    data: t
                }) => {
                    if (t instanceof Blob) return 0 === (e = await t.arrayBuffer()).byteLength ? void 0 : (this.player.appendBuffer(e), void(this.player.getIsOnPlay() || (this.stopCallRingAudio(), await this.player.play())));
                    var e = JSON.parse(t);
                    if ("backgroundSound" === e.event) try {
                        this.playBackAudio = new Audio(e.url), this.playBackAudio.loop = !0, this.playBackAudio.play().catch(t => {
                            console.error("Error playing audio:", t)
                        })
                    } catch (t) {
                        console.error("Error playing audio:", t)
                    } else "pause" === e.type && this.player?.stop?.(), "hangup" === e.type && (await this.hangUpCall(), a())
                }, this.microfoneInstance.ondataavailable = async t => {
                    this.socketInstance.readyState === WebSocket.OPEN && this.socketInstance.send(t.data)
                }
            }, this.socketInstance.onclose = async () => {
                a(), await this.hangUpCall()
            }
        }), this
    }
    async stop() {
        await this.hangUpCall(!1)
    }
    stopCallRingAudio() {
        try {
            this.callRingAudio.pause(), this.callRingAudio.currentTime = 0
        } catch (t) {
            console.log("error to pause")
        }
    }
    async hangUpCall(t = !0) {
        this.stopCallRingAudio();
        try {
            this.socketInstance && this.socketInstance.readyState === WebSocket.OPEN && this.socketInstance.close()
        } catch (t) {
            console.error(t)
        }
        try {
            this.player && (this.player.resetBuffer(), this.player.stop())
        } catch (t) {
            console.error(t)
        }
        try {
            this.playBackAudio && (this.playBackAudio.pause(), this.playBackAudio.currentTime = 0)
        } catch (t) {
            console.error(t)
        }
        try {
            this.microfoneInstance && (this.microfoneInstance?.stop?.(), this.microfoneInstance = null)
        } catch (t) {
            console.error(t)
        }
        t && await this.startHangupAudio()
    }
}

var c = document.currentScript;

function initializeCallFluent(id, callagent, endcall, callable, busyphone) {
    let baseApi = "https://api.callfluent.ai",
        InboundCallService = new InboundCall(Microfone, Player, baseApi);
    (async () => {
        console.log("inbound call embed script");
        async function t() {
            var t = baseApi + "/api/call-api/get-public-agent/" + id,
                t = (await (await fetch(t)).json())?.data?.agent,
                e = (console.log("agent", t), document.createElement("div")),
                n = (e.classList.add("callfluent_paper"), document.createElement("form")),
                a = (n.setAttribute("method", "post"), n.classList.add("outbound_form_embed"), document.createElement("div")),
                o = (a.classList.add("inbound_call_container"), document.createElement("img")),
                s = (o.src = t.avatar, o.classList.add("inbound_call_avatar"), document.createElement("div"));
            s.textContent = t.name, s.classList.add("inbound_call_name"), s.style.fontFamily = "Noto Sans, sans-serif";
            let i = document.createElement("div");
            i.textContent = callable, i.classList.add("inbound_call_status"), i.style.fontFamily = "Noto Sans, sans-serif";
            var t = document.createElement("div"),
                s = (t.classList.add("inbound_call_name_container"), t.appendChild(s), t.appendChild(i), a.appendChild(o), a.appendChild(t), n.appendChild(a), document.createElement("div")),
                r = document.createElement("button");
            r.style.fontWeight = "bold"; // 太字スタイルを適用
            r.style.fontFamily = "Noto Sans, sans-serif"; // フォントファミリーを適用
            r.textContent = callagent, s.appendChild(r), s.classList.add("callfluent_callbut"), n.appendChild(s), e.appendChild(n), c.parentNode.insertBefore(e, c.nextSibling);
            let l = !1;

            n.addEventListener("submit", async function(t) {
                t.preventDefault();
                var t = baseApi + "/api/call-api/make-inbound-call/" + id,
                    t = (await (await fetch(t, {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })).json())?.data,
                    e = t?.call;
                t?.agent;
                l ? (r.textContent = callagent, await InboundCallService.hangUpCall()) : (r.textContent = endcall, i.textContent = busyphone, i.classList.add("call_in_progress"), InboundCallService.start(e.id, "wss://api.callfluent.ai", () => {
                    r.textContent = callagent, l = !1, i.textContent = callable, i.classList.remove("call_in_progress"), console.log("inbound call ended")
                })), console.log("form submitted"), l = !l
            })
        }
        "complete" === document.readyState ? t() : window.addEventListener("load", t)
    })();
}

// セレクトメニューを生成する関数
function generateSelectMenu() {
    const select = document.getElementById('languageSelect');

    agentData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.properties.optionvalue.rich_text[0].plain_text;
        option.textContent = item.properties.optionlavel.rich_text[0].plain_text;
        option.classList.add('language-option');
        select.appendChild(option);
    });
}
