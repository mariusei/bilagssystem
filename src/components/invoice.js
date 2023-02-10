
import React, { useState, useEffect, useRef, createRef } from "react"

import { useForm } from "react-hook-form"

import pdfMake from "pdfmake/build/pdfmake"

import { Buffer } from "buffer";

import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry.webpack';

import PrivateRoute from "./privateRoute"
import StatusBar from "./statusbar"

//import Seo from "../components/seo"
import SVLogo from "../images/sv.png"

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


var fonts = {
    Roboto: {
        normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
        italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
        bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf'
    },
};

const Invoice = () => {
    const [errMsg, setErrMsg] = useState([])
    const [statusMsg, setStatusMsg] = useState([])

    const [googleToken, setGoogleToken] = useState()

    const {register, watch, handleSubmit, setValue} = useForm()

    const [contactInfo, setContactInfo] = useState({
          name : "",
          shortName : "",
          orgNo : "",
          postalAddress : "",
          emailToOrg : "",
          emailToLeader : "",
          incomeAccount : "",
          spendingsAccount : ""
    })
    const [invoiceNo, setInvoiceNo] = useState()

    const [pdfFile, setPdfFile] = useState()
    const [customPdfFile, setCustomPdfFile] = useState()

    const [urlToSheets, setUrlToSheets] = useState("")

    // PDF Viewer
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    // Load Google Auth Token from local storage
    useEffect(() => {
        // Load Google Auth Token
        setGoogleToken(localStorage.getItem("google:tokens"))

    }, [])

    // If Google Token is in place, fetch data from Google Sheets API
    useEffect(() => {
        if (googleToken === undefined) return
        addToStatusMsg("Kobler til Google...");

        // Fetch remote data
        fetch(`/api/contactInfo`, {
            method: "POST",
            headers: {"Authorization": googleToken}
        })
        .then(async (msg) => {
            const out = await msg.json()
            clearMsg()

            //console.log("received msg:", msg)

            if (msg.status > 400) {
                throw new Error(
                    "Feil under henting av data fra Google Sheets "
                    + msg.status 
                    + " " 
                    + msg.statusText
                    + " " 
                    + out.message
                    + " - " 
                    + out.error
                )
            }
            return out
        })
        .then(data => {
            if (data) {
                setContactInfo(data)
            }
        })
        .catch(err => {
            console.error("received error:", err)
            setErrMsg(errMsg => [...errMsg, "Noe galt skjedde under henting av data fra Google Sheets: " + String(err)])
        })
    }, [googleToken])

    // Get current invoice number
    useEffect(() => {
        if (googleToken === undefined) return

        // Fetch remote data
        fetch(`/api/getInvoiceNumber`, {
            method: "POST",
            headers: {"Authorization": googleToken}
        })
        .then(async (msg) => {
            addToStatusMsg("Henter fakturanummer fra Google...");
            const out = await msg.json()
            clearMsg()

            //console.log("received msg:", msg)

            if (msg.status > 400) {
                throw new Error(
                    "Feil under henting av data fra Google Sheets "
                    + msg.status 
                    + " " 
                    + msg.statusText
                    + " " 
                    + out.message
                    + " - " 
                    + out.error
                )
            }
            return out
        })
        .then(data => {
            //console.log("received data:", data)
            if (data) {
                setInvoiceNo(data.nextInvoiceNo)
                setUrlToSheets(data.urlToSheets)
            }
        })
        .catch(err => {
            console.error("received error:", err)
            setErrMsg(errMsg => [...errMsg, "Noe galt skjedde under henting av data fra Google Sheets: " + String(err)])
        })
    }, [googleToken])

    function addToStatusMsg(msg) {
        //console.log("ADDING TO STATUS MSG: ", msg, "EXISTING: ", statusMsg)
        setStatusMsg(statusMsg => [...statusMsg, msg])
    }

    // Clears error and status popup message
    function clearMsg() {
        setErrMsg([])
        setStatusMsg([])
    }

    function onDocumentLoadSuccess({ numPages }) {
        //console.log("document load success, numpages:", numPages)
        setNumPages(numPages);
    }

    useEffect(() => {
        setValue("fromName", contactInfo.name)
        setValue("fromAddress", contactInfo.postalAddress)
        setValue("fromOrgNo", contactInfo.orgNo)
        setValue("fromEmail", contactInfo.emailToLeader)
        setValue("toAccount", contactInfo.incomeAccount)
    }, [contactInfo])

    useEffect(() => {
        setValue("invoiceNo", invoiceNo)
        setValue("fileName", `faktura-${invoiceNo}.pdf`)
    }, [invoiceNo])


    function numberToAccountNumber(val) {
        let out = ""
        out = `${val.slice(0,4)}.${val.slice(4,6)}.${val.slice(6,11)}`
        return out
    }

    // Definition of PDF document attachment that is drawn
    // Monitors form fields and updates correspondingly
    const docDefinition = {
        footer: function(currentPage, pageCount) { 
            return {text: 'Side ' + currentPage.toString() + ' av ' + pageCount,
            alignment: "center"}
        },
        content: [
          {
            columns: 
            [
                {stack: [
                    {text: watch("name"), style: {bold: true}},
                    {text: watch("address"), margin: [0,0,0,15]},
                    {text: watch("email"), lineHeight: 3},
                  ],
                width: "55%", 
                fontSize: 15,
                margin: [0, 50, 0, 15]
                },
                {table: {
                    widths: ['*'],
                    body: [
                        [{stack: [
                            {image: SVLogo, width: 50, alignment: "right", margin: [0,15,5,15]},
                            {text: watch("fromName"), margin: [0,0,0,5]},
                            {text: watch("fromAddress"), margin: [0,0,0,5]},
                            {text: `Org.nr. ${watch("fromOrgNo")}`, margin: [0,0,0,5]},
                            watch("fromEmail"),
                        ], fillColor: "#eee", margin: [5,5,5,5], fontSize: 10}],
                        [{stack: [
                            {text: `FAKTURA ${watch("invoiceNo")}`, fontSize: 20},
                            `Dato: ${watch("invoiceDate")}`,
                            {text:`Beløp: ${watch("amount")} kr`, margin: [0,10,0,0], fontSize: 15},
                            {text:`Betalingsfrist: ${watch("dueDate")}`, margin: [0,0,0,0]},
                            {text: `Til konto: ${watch("toAccount")}`, margin: [0,0,0,5]},
                            {text: watch("transferText"), margin: [0,0,0,5]},
                        ], margin: [5,15,5,5], lineHeight: 1.2}]
                    ]},
                layout: 'noBorders',
                width: "45%"
                },
            ],
            margin: [0,30]
          },

          {table: {
            widths: ['*', 'auto'],
            headerRows: 1,
            body: [
                ["Beskrivelse", "Beløp (MVA ikke inkl.)"],
                [watch("description"), `${watch("amount")} kr`]
            ]
          },
            layout: 'headerLineOnly',
            style: {fontSize: 15},
            margin: [0,60,0,145]
          },
          {table: {
            widths: ['*', 'auto'],
            headerRows: 0,
            body: [
                [`Overføres til ${watch("toAccount")}:`, `${watch("amount")} kr`],
                [watch("transferText"),''],
                [`Innen ${watch("dueDate")}`,''],
            ]
          },
            layout: 'noBorders',
            style: {fontSize: 12},
        },

        ],
        // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
        pageMargins: [ 90, 70, 90, 70 ],

      };

    // FORM
    
    function sendToSheets(data, urlToFile) {
        addToStatusMsg("Sender fakturainfo til regnskapet...")
        let fromApiToGoogle = {}

        if (
            typeof data !== 'object' ||
            data === null ||
            Array.isArray(data)
        ) {
            throw Error("Mangler data! Er:" + String(data))
        }

        if (!urlToFile || typeof urlToFile !== 'string') {
            throw Error("Ugyldig URL til PDF fil:" + String(urlToFile))
        }

        data.urlToFile = urlToFile
        fetch("/api/addInvoiceToSheets", {
            method: "POST",
            headers: {"Authorization": googleToken},
            body: JSON.stringify(data)
        })
        .then(async (res) => {
            const out = await res.json()
            if (res.status > 400) {
                throw new Error("Kunne ikke legge til linje i Google Sheets - se XHR respons-feilmelding. : "
                + res.status
                + " "
                + res.statusText
                + " - " 
                + out.message
                + " " 
                + out.error)
            }
            return out
        })
        .then(data => {
            fromApiToGoogle = data
            //console.log("received from API:", fromApiToGoogle)
            addToStatusMsg(<a href={fromApiToGoogle.url} target="_blank" rel="noopener noreferrer">Linje lagt til - åpne Google Sheets</a>)
        })
        .catch(err => {
            console.error("Error submitting form data to server:", err)
            setErrMsg(errMsg => [...errMsg, "Feil under sending av data til Google: " + String(err)])
        })
    }
    
    function sendToDrive(data, rawPdfFile) {
        addToStatusMsg("Sender PDF til lagring...")

        if (
            typeof data !== 'object' ||
            data === null ||
            Array.isArray(data)
        ) {
            throw Error("Mangler data! Er:" + String(data))
        }

        if (!rawPdfFile || typeof rawPdfFile !== 'string') {
            throw Error("Ugyldig PDF fil")
        }

        let formData = new FormData();
        formData.append('uploadedFile', 
            new Blob([Buffer.from(rawPdfFile.substring(rawPdfFile.indexOf(",")), 'base64')], 
            {type: 'application/pdf'}),
            data.fileName
            )

        //console.log("Uploading this PDF:", formData) //toUpload)
        fetch("/api/pdf/invoice", {
            method: "POST",
            headers: {"Authorization": googleToken,
            },
            body: formData 
        })
        .then(async (res) => {
            const out = await res.json()
            if (res.status > 400) {
                throw new Error("Feil under opplastning - " 
                + res.status 
                + " " 
                + res.statusText
                + " - " 
                + out.message
                + " " 
                + out.error)
            }
            return out
        })
        .then(msg => {
            console.log("sent PDF")
            //console.log("sendte PDF: ", msg)
            //addToStatusMsg("Sendte PDF: " + msg.message)
            addToStatusMsg(<a href={msg.urlFile} target="_blank" rel="noopener noreferrer">Åpne fil</a>)
            addToStatusMsg(<a href={msg.urlFolder} target="_blank" rel="noopener noreferrer">Åpne Google Drive</a>)
            return msg.urlFile
        })
        .then(urlToFile => {
            try {
                sendToSheets(data, urlToFile)
            }
            catch (error) {
                console.error("Error submitting PDF to server:", error)
                setErrMsg(errMsg => [...errMsg, "Feil i sending av PDF til server: " + String(error)])
            }

        })
        .catch(err => {
            console.error("Error submitting PDF to server:", err)
            setErrMsg(errMsg => [...errMsg, "Feil i sending av PDF til server: " + String(err)])
        })
    }

    function onSubmit(data) {

        clearMsg()

        // Upload PDF to Google Drive
        try {
            sendToDrive(data, pdfFile)
        }
        catch (error) {
            console.error("Error submitting PDF to server:", error)
            setErrMsg(errMsg => [...errMsg, "Feil i sending av PDF til server: " + String(error)])
        }

    }

    function onChangeForm(data) {
        onUpdatePdfFile()
    }

    function onUpdatePdfFile() {
        const pdfDocGenerator = pdfMake.createPdf(docDefinition, null, fonts);
        
        pdfDocGenerator.getDataUrl((dataUrl) => {
            setPdfFile(dataUrl)
        })
    }

  return (
    <>
        <StatusBar statusMsg={statusMsg} errMsg={errMsg} clearMsg={clearMsg} />
        <h1>Lag faktura</h1>

        <div className="formAndPreview">
        <form onSubmit={handleSubmit(onSubmit)} onBlur={onChangeForm}>
            <section>
                <h2>Mottaker</h2>
                <label>
                    Til:
                    <input type="text"
                    placeholder="Mottagers navn"
                    {...register("name")}
                    ></input>
                </label>

                <label>
                    E-post:
                    <input type="text"
                    placeholder="Mottagers e-postadresse"
                    {...register("email")}
                    ></input>
                </label>

                <label>
                    Adresse:
                    <textarea
                    {...register("address")}
                    ></textarea>
                </label>
                <label>
                    Fakturadato:
                    <input type="date" {...register("invoiceDate")}></input>
                </label>
            </section>

            <section>
                <h2>Innhold</h2>
                <label>
                    Beløp:
                    <input type="number"
                    placeholder="kr"
                    {...register("amount")}
                    ></input>
                </label>
                <label htmlFor="isIncoming">
                    MVA inkludert?
                    <input 
                    type="checkbox" {...register("MVA")}
                    disabled 
                    ></input>
                </label>
                <label>
                    Beskrivelse:
                    <textarea
                    placeholder="Beskriv hva det faktureres for"
                    {...register("description")}
                    ></textarea>
                </label>
                <label style={style.formLabel}>
                    Betalingsfrist:
                    <input type="date" {...register("dueDate")}></input>
                </label>
                <label>
                    Betales til:
                    <input type="text"
                    placeholder="kontonr."
                    {...register("toAccount", 
                        {setValueAs: v => numberToAccountNumber(v)} 
                    )}
                    ></input>
                </label>
                <label>
                    Be om en melding:
                    <input type="text"
                    placeholder='Betalingen merkes "..."'
                    {...register("transferText")}
                    ></input>
                </label>
            </section>
            <section>
                <h2>Avsender</h2>
                <label>
                    Fra:
                    <input type="text"
                    {...register("fromName")}
                    defaultValue={contactInfo.name}
                    ></input>
                </label>
                <label>
                    E-post:
                    <input type="text"
                    {...register("fromEmail")}
                    value={contactInfo.emailToOrg}
                    ></input>
                </label>
                <label>
                    Adresse:
                    <textarea
                    {...register("fromAddress")}
                    value={contactInfo.postalAddress}
                    ></textarea>
                </label>
                <label>
                    Org.nr.:
                    <input type="text"
                    {...register("fromOrgNo")}
                    value={contactInfo.orgNo}
                    ></input>
                </label>
                <p style={{fontSize: "small"}}>
                    Denne informasjonen kan endres i fanen "Kontaktinformasjon" <a href={urlToSheets}>her</a>.
                </p>
            </section>
            <section>
                <h2>Last opp</h2>
                <label>
                    Filnavn:
                    <input type="text"
                    disabled
                    {...register("fileName")}
                    ></input>
                </label>

                <button>Send inn</button>

            </section>
        </form>
        <div className="preview">
            {pdfFile && 
            <div>
                {numPages > 1 &&
                <div className="buttonRow">
                    <button onClick={() => setPageNumber(pg => pg-1)} disabled={pageNumber==1}>Forrige side</button>
                    <span style={{width: "30%", textAlign: "center"}}> {pageNumber}</span>
                    <button onClick={() => setPageNumber(pg => pg+1)}  disabled={pageNumber>= numPages}>Neste side</button>
                </div>
                }
            <Document className="pdfContainer" 
                file={pdfFile} 
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={console.error}
            >
                <Page className="pdfPage" pageNumber={pageNumber} width={400}/>
            </Document>
            </div>
            }
        </div>
        </div>
    </>
  )
  }

const style = {
    mainContent: {
        width: "100%",
        display: "flex",
        flexDirection: "row"
    },
}

export default Invoice