import qrImage from '../../assets/images/site-qr.png'

function QRCodeBlock() {
  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-3 shadow-sm">
      <img
        src={qrImage}
        alt="QR Code"
        className="h-36 w-36 object-contain sm:h-40 sm:w-40"
      />
    </div>
  )
}

export default QRCodeBlock
