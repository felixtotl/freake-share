import { useState } from "react";
import JSZip from "jszip";
import Head from "next/head";

export default function Home() {
  const [uploadFiles, setUploadFiles] = useState([]);
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [unzipFile, setUnzipFile] = useState(null);
  const [unzippedFiles, setUnzippedFiles] = useState([]);
  const [error, setError] = useState("");
  // Setzen Sie dies auf false, um zu simulieren, dass der Dienst abgeschaltet ist.
  const [isFreakShareActive, setIsFreakShareActive] = useState(false); 

  const mailBody = `Hallo!

ich habe dir soeben eine Datei über FreakeShare zukommen lassen. Du kannst sie sicher und bequem unter folgendem Link herunterladen: 

${url}

Und so einfach geht es: Klicke auf den Link oben. Der Download startet dann automatisch. Bitte beachte jedoch, dass es sich um eine ZIP-Datei handelt. Besuche deshalb anschließend die offizielle FreakeShare-Website (https://freake-share.vercel.app) und suche dort nach dem Bereich "ZIP entpacken". Dort kannst du die heruntergeladene Datei hochladen, um sie zu entpacken. Danach kannst du die Dateien einzeln herunterladen oder nur die, die du benötigst.

Die FreakeShare-Plattform ist eine vertrauenswürdige Quelle für diese Art von Dateien, sodass du dir keine Sorgen machen musst.

Viele Grüße`;

  const mailtoLink = `mailto:?subject=Ich%20habe%20dir%20eine%20Datei%20über%20FreakeShare%20geschickt!&body=${encodeURIComponent(mailBody)}`;

  const handleUploadChange = (e) => {
    setUploadFiles(Array.from(e.target.files));
    setUrl("");
    setError(""); // Fehler zurücksetzen, wenn neue Dateien ausgewählt werden
  };

  const handleCopyToClipboard = async () => {
    if (url) {
      try {
        await navigator.clipboard.writeText(url);
        alert("Link in die Zwischenablage kopiert!");
      } catch (err) {
        console.error("Fehler beim Kopieren des Links: ", err);
        alert("Fehler beim Kopieren des Links.");
      }
    }
  };

  const handleUpload = async () => {
    // Überprüfen, ob Freak Share aktiv ist, BEVOR der Upload-Vorgang beginnt
    if (!isFreakShareActive) {
      setError("Freake Share ist derzeit abgeschaltet, wird aber bald wieder aktiviert.");
      return; // Beendet die Funktion frühzeitig
    }

    if (uploadFiles.length === 0) return; // Stellen Sie sicher, dass Dateien ausgewählt sind
    setUploading(true);
    setError(""); // Vor dem Upload den Fehler zurücksetzen
    setUrl("");
    setUnzippedFiles([]);

    try {
      const zip = new JSZip();
      uploadFiles.forEach((file) => zip.file(file.name, file));
      const zipBlob = await zip.generateAsync({ type: "blob" });

      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const fileName = `freake-share-${day}-${month}-${year}-${randomId}.zip`;

      const zipFile = new File([zipBlob], fileName, {
        type: "application/zip",
      });

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "content-type": "application/zip",
        },
        body: zipFile,
      });

      const data = await res.json();
      res.ok ? setUrl(data.url) : setError(data.error || "Unbekannter Fehler");
    } catch (err) {
      setError("Fehler: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUnzipChange = (e) => {
    setUnzipFile(e.target.files[0] || null);
    setUnzippedFiles([]);
    setError(""); // Fehler zurücksetzen, wenn neue Datei ausgewählt wird
  };

  const handleUnzip = async () => {
    if (!unzipFile || unzipFile.type !== "application/zip") {
      setError("Bitte eine einzelne ZIP-Datei auswählen");
      return;
    }

    try {
      const zip = await JSZip().loadAsync(unzipFile);
      const files = await Promise.all(
        Object.keys(zip.files).map(async (filename) => ({
          name: filename,
          blob: await zip.files[filename].async("blob"),
        }))
      );
      setUnzippedFiles(files);
    } catch (err) {
      setError("Fehler beim Entpacken: " + err.message);
    }
  };

  return (
    <>
      <Head>
        <title>Freake Share</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="header">
        <h1>Willkommen bei <strong>Freake Share</strong></h1>
        <p>Einfach Dateien zippen, teilen oder entpacken</p>
      </div>

      <div className="container">
        {/* Upload */}
        <div className="box">
          <h2>Dateien hochladen</h2>
          <input type="file" multiple onChange={handleUploadChange} />
          <br />
          {/* Der Button ist nur deaktiviert, wenn keine Dateien ausgewählt sind oder ein Upload läuft */}
          <button onClick={handleUpload} disabled={uploadFiles.length === 0 || uploading}>
            {uploading ? "Lade Dateien hoch..." : "Dateien hochladen"}
          </button>

          {url && (
            <>
              <p style={{ marginTop: "20px" }}>
                ✅ Hochgeladen:{" "}
                <a href={url} target="_blank" rel="noopener noreferrer">
                  Download-Link
                </a>
              </p>
              <a href={mailtoLink}>
                <button>Email mit Link verschicken</button>
              </a>
              <button style={{ marginLeft: "10px" }} onClick={handleCopyToClipboard}>Link kopieren</button>
            </>
          )}
        </div>

        {/* Entpacken */}
        <div className="box">
          <h2>ZIP entpacken</h2>
          <input type="file" accept=".zip" onChange={handleUnzipChange} />
          <br />
          <button onClick={handleUnzip} disabled={!unzipFile}>
            ZIP entpacken
          </button>

          {unzippedFiles.length > 0 && (
            <ul>
              {unzippedFiles.map((f, i) => (
                <li key={i}>
                  {f.name} —{" "}
                  <a
                    href={URL.createObjectURL(f.blob)}
                    download={f.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    herunterladen
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {error && <p className="error">⚠️ Fehler: {error}</p>}

      <footer>
        <a href="https://www.freake-chatnet.cloudns.ch/impressum-datenschutz-erklärung-mehr">Impressum</a> |{" "}
        <a href="https://www.freake-chatnet.cloudns.ch/impressum-datenschutz-erklärung-mehr">Datenschutz</a>
      </footer>
    </>
  );
}
