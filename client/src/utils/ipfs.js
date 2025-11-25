export async function uploadToIPFS(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: process.env.REACT_APP_PINATA_KEY,
      pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET,
    },
    body: formData,
  });

  const data = await res.json();

  if (!data.IpfsHash) {
    throw new Error("Upload gagal ke Pinata");
  }

  return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
}
