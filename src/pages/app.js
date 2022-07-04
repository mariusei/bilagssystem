import React, { useState, useEffect } from "react"
import { navigate } from "gatsby"
import { Router } from "@reach/router"

import { useForm } from "react-hook-form"

import pdfMake from "pdfmake/build/pdfmake"
//import pdfFonts from "pdfmake/build/vfs_fonts"
import { Buffer } from "buffer";

import PrivateRoute from "../components/privateRoute"

import Layout from "../components/layout"
//import Seo from "../components/seo"


var fonts = {
    Roboto: {
        normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
        italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
        bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf'
      },
  };



//pdfMake.vfs = pdfFonts.pdfMake.vfs;

const LoggedIn = () => {
    const {register, watch, handleSubmit, setValue} = useForm()

    const [googleToken, setGoogleToken] = useState()

    const [expenseTypes, setExpenseTypes] = useState()
    const [bankAccounts, setBankAccounts] = useState()
    
    const [toImage, setToImage] = useState()
    const [toImageURI, setToImageURI] = useState()

    const [pdfFile, setPdfFile] = useState()
    const [customPdfFile, setCustomPdfFile] = useState()

    function SelectFromKeyValueObject(props) {
        const objectWithKeyValues = props.obj
        const formLabel = props.label
        let options = []

        if (objectWithKeyValues === undefined) return <option>Missing</option>

        console.log("Adding:", formLabel)

        for (const key in objectWithKeyValues)
        {
            options.push(<option value={key}>{objectWithKeyValues[key]}</option>)
        }
        return (
        <select {...register(formLabel)}>
            {options}
        </select>
        )
    }

    const docDefinition = {
        content: [
          {text: 'Bilag - Lillestrøm Sosialistiske Venstreparti', lineHeight: 2},
          'Jonas Lies gate 18',
          '2000 Lillestrøm',
          'Org.nr. 896 853 082',
          {text: watch("accountDate"), lineHeight:3, alignment: "right", fontSize: 20}, 
          {text: 'Beløp: '},
          {text: watch("amount") + " kr", fontSize: 24, lineHeight: 3},
          {text: 'Beskrivelse i regnskapet:'},
          {text: watch("description"), lineHeight:3, fontSize: 20}, 

          {text: "Til:"},
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
          (toImageURI && {image: toImageURI, width: 500, alignment: "center"})
          

        ],
        // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
        pageMargins: [ 90, 70, 90, 70 ],

      };

    useEffect(() => {
        // Load Google Auth Token
        setGoogleToken(localStorage.getItem("google:tokens"))

    }, [])
    
    useEffect(() => {
        // If Google Token is in place, fetch data from API
        if (googleToken === undefined) return

        // Fetch remote data
        fetch(`/api/sheets`, {
            method: "POST",
            headers: {"Authorization": googleToken}
        })
        .then((msg) => {
            console.log("received msg:", msg)
            return msg.json()
        })
        .then(data => {
            console.log("received data:", data)
            if (data.expenseTypes) setExpenseTypes(data.expenseTypes)
            if (data.bankAccounts) setBankAccounts(data.bankAccounts)
        })
        .catch(err => {
            console.error("received error:", err)
        })
    }, [googleToken])

    useEffect(() => {
        let fileReader, isCancel = false;
        if (toImage) {
          fileReader = new FileReader();
          fileReader.onload = (e) => {
            const { result } = e.target;
            if (result && !isCancel) {
                setToImageURI(result)
            }
          }
          fileReader.readAsDataURL(toImage);
        }
        return () => {
          isCancel = true;
          if (fileReader && fileReader.readyState === 1) {
            fileReader.abort();
          }
        }
    
      }, [toImage]);

      useEffect(() => {
        if (customPdfFile) {
            let fileReader = new FileReader();
            fileReader.onload = (e) => {
                const { result } = e.target;
                if (result) {
                    console.log("Done readgin! result:", result)
                    setPdfFile(result)
                }
            }
            fileReader.readAsDataURL(customPdfFile);
        }
      }, [customPdfFile])


    const onChangeImage = (data) => {
        setToImage(data.target.files[0])
    }

    const onChangeForm = (data) => {
        // update filename based on inputs

        const randomName = (Math.random() + 1).toString(36).substring(10)

        setValue("toFileName", 
            "XX" + randomName + "-" + watch("accountDate") + "-" + watch("description").replaceAll(" ", "_").replaceAll("/", "-") + ".pdf"
        )
        setValue("attachmentNo", watch("toFileName").substring(0,4))

        if (customPdfFile === undefined) {
            const pdfDocGenerator = pdfMake.createPdf(docDefinition, null, fonts);
            pdfDocGenerator.getDataUrl((dataUrl) => setPdfFile(dataUrl))
        }

        //setValue("toFilePDF", pdfFile)
    }

    const onSetExternalPDF = (data) => {
        console.log("Set: custom PDF", data)
        console.log("Found file:", data.target.files[0])
        setCustomPdfFile(data.target.files[0])

    }

    let fromApiToGoogle = {}


    const onSubmit = (data) => { 
        //alert(JSON.stringify(data))
        data.externalPDF = ''
        data.toFileImage = ''
        console.log(data)
        fetch("/api/addToSheets", {
            method: "POST",
            headers: {"Authorization": googleToken},
            body: JSON.stringify(data)
        })
        .then((res) => res.json())
        .then(data => fromApiToGoogle = data)
        .catch(err => {
            console.error("Error submitting form data to server:", err)
        })

        console.log("received from API:", fromApiToGoogle)

        // Upload PDF
       
        let formData = new FormData();
        formData.append('uploadedFile', 
            new Blob([Buffer.from(pdfFile.substring(pdfFile.indexOf(",")), 'base64')], 
            {type: 'application/pdf'}),
            data.toFileName
            )

        console.log("Uploading this PDF:", formData) //toUpload)
        fetch("/api/addPDF", {
            method: "POST",
            headers: {"Authorization": googleToken,
            //"toFileName": data.toFileName 
            },
            body: formData //toUpload
        })
        .catch(err => {
            console.error("Error submitting PDF to server:", err)
        })
    
    }

  return (
    <Layout>
        <h1>Registrer bilag</h1>
        <button
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
          Logout
        </button>

        <div style={style.mainContent}>
        <form style={style.form} onSubmit={handleSubmit(onSubmit)} onBlur={onChangeForm}>
            <h2>Regnskap</h2>
            <label style={style.formLabel}>
                Type inntekt/utgift:
                {expenseTypes && 
                    <SelectFromKeyValueObject obj={expenseTypes} label="expenseTypeColNo" />
                }
            </label>
            
            <label style={style.formLabel}>
                Trekkes fra konto:
                {bankAccounts && 
                    <SelectFromKeyValueObject obj={bankAccounts} label="creditColNo" />
                }
            </label>

            <label style={style.formLabel}>
                Dato for kontobevegelse:
                <input type="date" {...register("accountDate")}></input>
            </label>

            <label style={style.formLabel}>
                Beskrivelse:
                <input type="text" 
                 placeholder="Match med bankovf.tekst" 
                 {...register("description")}></input>
            </label>

            <label style={style.formLabel}>
                Beløp:
                <input type="number" {...register("amount")}></input>
            </label>

            <label style={style.formLabel}>
                Bilagsnummer:
                <input type="text" {...register("attachmentNo")}></input>
            </label>

            <h2>Bilag</h2>

            <label style={style.formLabel}>
                Til:
                <input type="text" {...register("toReceiver")}></input>
            </label>
            
            <label style={style.formLabel}>
                Kontonummer:
                <input type="text" {...register("toAccount")}></input>
            </label>

            <label style={style.formLabel}>
                Beskrivelse:
            </label>
            <textarea style={style.formLabel} {...register("toDescription")}></textarea>

            <label style={style.formLabel}>
                Bildevedlegg:
                <input type="file" 
                 accept="image/png, image/jpeg"
                 {...register("toFileImage", {
                     onChange: (e) => onChangeImage(e)
                 })}
                ></input>
            </label>

            <h2>Eller last opp en fil...</h2>

            <label style={style.formLabel}>
                PDF-vedlegg:
                <input type="file" 
                 accept=".pdf"
                 {...register("externalPDF", {
                 onChange: (e) => onSetExternalPDF(e)})}
                ></input>
                <button onClick={() => {
                    setCustomPdfFile()
                    setValue("externalPDF", undefined)
                    setPdfFile('')
                    return false
                }}>Fjern</button>
            </label>

            

            <h2>Passordbeskyttelse</h2>

            <label style={style.formLabel}>
                 Passord:
                 <input type="password" {...register("toFilePassword")}></input>
            </label>

            <label style={style.formLabel}>
                 Filnavn:
                 <input type="text" {...register("toFileName")}></input>
            </label>


            <input type="submit" value="Send inn" />
        </form>
        <iframe style={style.form} src={pdfFile}>
        </iframe>
        </div>
    </Layout>
  )
}

const style = {
    mainContent: {
        width: "100%",
        display: "flex",
        flexDirection: "row"
    },
    form: {
        width: "50%",
        //border: "1px solid red",
        display: "flex",
        flexDirection: "column"
    },
    formLabel: {
        //border: "1px solid blue",
        height: 40
    }
}

export default function App() {
  return (
    <>
      <Router>
        <PrivateRoute path="/app" component={LoggedIn} />
      </Router>
    </>
  )
}