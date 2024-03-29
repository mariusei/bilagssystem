import React, { useState, useEffect, useRef, createRef } from "react"
import { navigate } from "gatsby"

import { useForm } from "react-hook-form"

import pdfMake from "pdfmake/build/pdfmake"

import { Buffer } from "buffer";

import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry.webpack';

import PrivateRoute from "./privateRoute"
import StatusBar from "./statusbar"

import Layout from "./layout"
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


const Attachment = () => {
    const [errMsg, setErrMsg] = useState([])
    const [statusMsg, setStatusMsg] = useState([])

    const {register, watch, handleSubmit, setValue} = useForm()

    const [googleToken, setGoogleToken] = useState()

    const [expenseTypes, setExpenseTypes] = useState()
    const [bankAccounts, setBankAccounts] = useState()
    
    const [toImageURI, setToImageURI] = useState([])

    const [pdfFile, setPdfFile] = useState()
    const [customPdfFile, setCustomPdfFile] = useState()

    // PDF Viewer
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    const [numPagesAtt, setNumPagesAtt] = useState()
    const [attPages, setAttPages] = useState()

    // Fetch PDF contents and reference them later
    const myPdfCanvasContainer = useRef();

    // Load Google Auth Token from local storage
    useEffect(() => {
        // Load Google Auth Token
        setGoogleToken(localStorage.getItem("google:tokens"))

    }, [])
    
    // If Google Token is in place, fetch data from API
    useEffect(() => {
        if (googleToken === undefined) return

        addToStatusMsg("Kobler til Google...");
        // Fetch remote data
        fetch(`/api/sheets`, {
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
            //console.log("received data:", data)
            console.log("received sheet data")
            if (data.expenseTypes) setExpenseTypes(data.expenseTypes)
            if (data.bankAccounts) setBankAccounts(data.bankAccounts)
        })
        .catch(err => {
            console.error("received error:", err)
            setErrMsg(errMsg => [...errMsg, "Noe galt skjedde under henting av data fra Google Sheets: " + String(err)])
        })
    }, [googleToken])

    // Redraw PDF if there is a change in the images array 
    // (uploaded or generated from att. PDF)
    useEffect(() => {
        if (toImageURI.length > 0) { onUpdatePdfFile() }
    }, [toImageURI])

    // Monitor changes in number of pages in attachment file
    // if changes, then draw these pages
    // which finally triggers drawing of images that are included
    // in final PDF
    useEffect(() => {
        if (numPagesAtt) { generateAttPages() }

    }, [numPagesAtt])

    function onDocumentLoadSuccess({ numPages }) {
        console.log("document load success, numpages:", numPages)
        setNumPages(numPages);
    }

    function addToStatusMsg(msg) {
        console.log("ADDING TO STATUS MSG: ", msg, "EXISTING: ", statusMsg)
        setStatusMsg(statusMsg => [...statusMsg, msg])
    }

    // Clears error and status popup message
    function clearMsg() {
        setErrMsg([])
        setStatusMsg([])
    }

    function SelectFromKeyValueObject(props) {
        console.log("received info: ", props)
        const objectWithKeyValues = props.obj
        const formLabel = props.label
        let options = []

        if (objectWithKeyValues === undefined) return <option>Missing</option>

        console.log("Adding:", formLabel)

        for (const key in objectWithKeyValues)
        {
            options.push(<option key={key} value={key}>{objectWithKeyValues[key]}</option>)
        }
        return (
        <select {...register(formLabel)}>
            {options}
        </select>
        )
    }

    // Images that are embedded in PDF
    const docImages = () => {
        let imgList = []

        if (toImageURI.length > 0) {
            for (let index = 0; index < toImageURI.length; index++) {
                imgList.push([{image: toImageURI[index], width: 415.35, alignment: "center"}])
            }

            return {'table': {
                body: imgList,
                widths: ['100%']
            }}
        }
        else return {}
    }

    // Definition of PDF document attachment that is drawn
    // Monitors form fields and updates correspondingly
    const docDefinition = {
        userPassword: watch("toFilePassword"),
        footer: function(currentPage, pageCount) { 
            return {text: 'Side ' + currentPage.toString() + ' av ' + pageCount,
            alignment: "center"}
        },
        content: [
          {
            columns: 
            [
                {stack: [{text: 'Bilag - Lillestrøm Sosialistiske Venstreparti'},
                  'Jonas Lies gate 18',
                  '2000 Lillestrøm',
                  'Org.nr. 896 853 082',
                  ],
                width: "70%"
                },
                [{image: SVLogo, width: 50, alignment: "right"}]
            ],
            margin: [0,30]
          },
          {text: watch("accountDate"), lineHeight:3, alignment: "right", fontSize: 20}, 
          {text: 'Beløp: '},
          {text: watch("amount") + " kr", fontSize: 24, lineHeight: 3},
          {text: 'Beskrivelse i regnskapet:'},
          {text: watch("description"), lineHeight:3, fontSize: 20}, 

          {text: (watch("isIncoming")) ? "Fra" : "Til"},
          {text: watch("toReceiver") , fontSize: 14, lineHeight: 1.5},
          {text: "Kontonummer:"},
          {text: watch("toAccount"), fontSize: 14, lineHeight: 1.5},
          {text: "Beskrivelse:"},
          {table: {
            widths: ['*'],
            body: [[{text: watch("toDescription"), fontSize: 14, lineHeight: 1, fillColor: "#eee"}]]  
            },
           layout: 'noBorders',
          },
          docImages(),
          //(toImageURI && {image: toImageURI, width: 500, alignment: "center"})
          

        ],
        // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
        pageMargins: [ 90, 70, 90, 70 ],

      };

    // Called when attachment PDF is done rendering
    // can now generate images to PDF
    const findAttPdf = () => {
        let imageList = []
        //console.log("myPdfCanvasContainer:", myPdfCanvasContainer)
        for (let index = 0; index < myPdfCanvasContainer.current.length; index++) {
            imageList.push(myPdfCanvasContainer.current[index].current.toDataURL('image/jpeg'))
        }
        setToImageURI(imageList)
    }

    // Uploading images -> read into toImageURI which triggers PDF redraw
    const onChangeImage = async (data) => {
        console.log("set new image")
        //console.log("set new image:", data)
        //setToImage(data.target.files[0])

        const files = [...data.target.files].map(file => {
            const reader = new FileReader();
            return new Promise(resolve => {
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(file);
            });
        });
        const res = await Promise.all(files);
        //console.log(res)
        setToImageURI(res)
    }

    const onChangeForm = (data) => {
        // update filename based on inputs

        //console.log("onChangeForm, data:", data)

        const randomName = (Math.random() + 1).toString(36).substring(10)

        setValue("toFileName", 
            "XX" + randomName + "-" + watch("accountDate") + "-" + watch("description").replaceAll(" ", "_").replaceAll("/", "-") + ".pdf"
        )
        setValue("attachmentNo", watch("toFileName").substring(0,4))

        onUpdatePdfFile()

        //console.log("isIncoming:", watch("isIncoming"))//, "and text:", toOrFrom)

        //setValue("toFilePDF", pdfFile)
    }

    function onUpdatePdfFile() {
        //console.log("onUpdatePdfFile and customPdfFile is:", customPdfFile)

        const pdfDocGenerator = pdfMake.createPdf(docDefinition, null, fonts);
        
        pdfDocGenerator.getDataUrl((dataUrl) => {
            setPdfFile(dataUrl)
            //console.log("Generating PDF:", dataUrl)
        })
    }

    const onSetExternalPDF = (data) => {
        //console.log("Set: custom PDF", data)
        //console.log("Found file:", data.target.files[0])
        setCustomPdfFile(data.target.files[0])

    }

    let fromApiToGoogle = {}

    const onSubmit = (data) => { 
        clearMsg()
        addToStatusMsg("Sender data til regneark...")
        //alert(JSON.stringify(data))
        data.externalPDF = ''
        data.toFileImage = ''
        data.toFilePassword = ''
        //console.log(data)
        fetch("/api/addToSheets", {
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


        // Upload PDF

        addToStatusMsg("Sender bilag til Google Drive...")
        console.log("Uploading to Drive")
       
        let formData = new FormData();
        formData.append('uploadedFile', 
            new Blob([Buffer.from(pdfFile.substring(pdfFile.indexOf(",")), 'base64')], 
            {type: 'application/pdf'}),
            data.toFileName
            )

        //console.log("Uploading this PDF:", formData) //toUpload)
        fetch("/api/addPDF", {
            method: "POST",
            headers: {"Authorization": googleToken,
            //"toFileName": data.toFileName 
            },
            body: formData //toUpload
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
        })
        .catch(err => {
            console.error("Error submitting PDF to server:", err)
            setErrMsg(errMsg => [...errMsg, "Feil i sending av PDF til server: " + String(err)])
        })
    
    }

    // Generate PDF pages from attachment
    // not actually shown in browser, but are used to
    // generate images to main PDF
    function generateAttPages(props) {

        console.log("generateAttPages for numPagesAtt:", numPagesAtt)

        let pages = []
        let newRefList = new Array(numPagesAtt)

        for (let index = 0; index < numPagesAtt; index++) {
            newRefList[index] = myPdfCanvasContainer.current ? myPdfCanvasContainer.current[index] ?? createRef() : createRef()
        }
        myPdfCanvasContainer.current = newRefList

        for (let index = 1; index < numPagesAtt+1; index++) {
            pages.push(<Page 
                canvasRef={myPdfCanvasContainer.current[index-1]}
                onRenderSuccess={findAttPdf}
                pageNumber={index}
                key={index}
                className="pdfPage" 
                width={1200}/>)
        }

        console.log("we have pages:", pages)

        // Push list of "Page" objects to state
        setAttPages(pages)

    }

  return (
    <>
        <StatusBar statusMsg={statusMsg} errMsg={errMsg} clearMsg={clearMsg} />
        <h1>Registrer bilag</h1>

        <div className="formAndPreview">
        <form onSubmit={handleSubmit(onSubmit)} onBlur={onChangeForm}>
            <section>
            <h2>Regnskap</h2>
            <label>
                Type inntekt/utgift:
                {expenseTypes && 
                    <SelectFromKeyValueObject obj={expenseTypes} label="expenseTypeColNo" />
                }
            </label>
            
            <label>
                Trekkes fra konto:
                {bankAccounts && 
                    <SelectFromKeyValueObject obj={bankAccounts} label="creditColNo" />
                }
            </label>

            <label>
                Dato for kontobevegelse:
                <input type="date" {...register("accountDate")}></input>
            </label>

            <label>
                Beskrivelse:
                <input type="text" 
                 placeholder="Match med bankovf.tekst" 
                 {...register("description")}></input>
            </label>

            <label>
                Beløp:
                <input type="number" step="0.01" {...register("amount")}></input>
            </label>
            <label htmlFor="isIncoming">
                Innbetaling?
                <input type="checkbox" {...register("isIncoming")}></input>
            </label>

            </section>

            <section>
            <h2>Bilag</h2>

            <label>
                Til:
                <input type="text" {...register("toReceiver")}></input>
            </label>
            
            <label>
                Kontonummer:
                <input type="text" {...register("toAccount")}></input>
            </label>

            <label>
                Beskrivelse:
                <textarea {...register("toDescription")}></textarea>
            </label>
            
            <label>
                Bildevedlegg:
                <input type="file" 
                 accept="image/png, image/jpeg"
                 {...register("toFileImage", {
                     onChange: (e) => onChangeImage(e)
                 })}
                 multiple
                ></input>
            </label>

            <label>
                PDF-vedlegg:
                <input type="file" 
                 accept=".pdf"
                 {...register("externalPDF", {
                 onChange: (e) => onSetExternalPDF(e)})}
                ></input>
                <button type="button" onClick={() => {
                    setCustomPdfFile()
                    setValue("externalPDF", undefined)
                    setPdfFile('')
                    return false
                }}>X</button>
            </label>
            </section>

            <section>
            <h2>Passordbeskyttelse</h2>

            <label>
                 Passord:
                 <input type="password" {...register("toFilePassword")}></input>
            </label>

            <label>
                 Filnavn:
                 <input type="text" {...register("toFileName")}></input>
            </label>
            </section>
            <button>Send inn</button>
        </form>
        <div className="preview">
            <div style={{textAlign: "center"}}>
                {numPages == 1 && (<p>{numPages} side</p>)}
                {numPages > 1 && (<p>{numPages} sider</p>)}
            </div>
            {pdfFile && 
            <div>
                {numPages > 1 &&
                <div className="buttonRow">
                    <button onClick={() => setPageNumber(pg => pg-1)} disabled={pageNumber==1}>&lt;</button>
                    <span style={{width: "30%", textAlign: "center"}}> {pageNumber}</span>
                    <button onClick={() => setPageNumber(pg => pg+1)}  disabled={pageNumber>= numPages}>&gt;</button>
                </div>
                }
                <Document className="pdfContainer" 
                    file={pdfFile} 
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={console.error}
                    onPassword={(callback) => callback(watch("toFilePassword"))}
                >
                    <Page className="pdfPage" pageNumber={pageNumber} width={400}/>
                </Document>
            </div>
            }
            {customPdfFile && 
            <Document className="hidden" 
                file={customPdfFile} 
                onLoadSuccess={({numPages}) => setNumPagesAtt(numPages)}
                onLoadError={console.error}>
                    {attPages}
            </Document>
            }
        </div>
        </div>
        <button
          type="button"
          style={{backgroundColor: "#cecece"}}
          onClick={() => {
            fetch(`/api/logout?token=${googleToken}`, {
              method: "POST",
            })
              .then(() => {
                localStorage.removeItem("google:tokens")
                setGoogleToken()
                navigate("/logged-out")
              })
              .catch(err => {
                console.error(`Logout error: ${err}`)
              })
          }}
        >
          Logg ut
        </button>
    </>
  )
}


export default Attachment