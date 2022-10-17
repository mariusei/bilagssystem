import React from "react"

export default function StatusBar({ statusMsg, errMsg, clearMsg, ...rest}) {
    if ((statusMsg && statusMsg.length > 0) || (errMsg && errMsg.length > 0)) {
        return (
            <div style={style.statusStyle}>
                { statusMsg && statusMsg.length > 0 &&
                    <div style={style.status}>
                        <h2>Melding</h2>
                        {statusMsg.map((obj, i) => <p key={i}>{obj}</p>)}
                    </div>
                }
                { errMsg && errMsg.length > 0 &&
                    <div style={style.error}>
                        <h2>Feil</h2>
                        {errMsg.map((obj, i) => <p key={i}>{obj}</p>)}
                    </div>
                }
                <button
                    type="button"
                    style={style.buttonStyle}
                    onClick={() => clearMsg()}
                >Lukk</button>
            </div>
        )
    }
}

const style = {
    status: {
        width: "100%",
    },
    error: {
        width: "100%",
        color: "var(--color-code)"
    },
    statusStyle: {
        position: "fixed",
        display: "flex",
        zIndex: "1",
        flexDirection: "column",
        flexWrap: "wrap",
        alignContent: "center",
        width: "40%",
        padding: "1em",
        transform: "translateX(-50%)",
        top: "2em",
        left: "50%",
        border: "1px solid var(--color-primary)",
        backgroundColor: "#fff",
        boxShadow: "0.1em 0.1em 0.4em var(--color-text)"
    },
    buttonStyle: {
        alignSelf: "flex-end",
        padding: "0.5em"
    }
}