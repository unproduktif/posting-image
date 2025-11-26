export async function uploadToIPFS(file) {
  const PINATA_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  
  const jwt = process.env.REACT_APP_PINATA_JWT;
  if (!jwt) throw new Error("PINATA JWT belum di-set di .env");

  const formData = new FormData();
  formData.append("file", file);

  formData.append(
    "pinataMetadata",
    JSON.stringify({ name: file.name })
  );

  formData.append(
    "pinataOptions",
    JSON.stringify({ cidVersion: 1 })
  );

  const res = await fetch(PINATA_URL, {
    method: "POST",
    headers: {
      Authorization: jwt
    },
    body: formData,
  });

  const data = await res.json();

  if (!data.IpfsHash) throw new Error("Pinata tidak mengembalikan CID!");

  const GATEWAY = process.env.REACT_APP_PINATA_GATEWAY;
  return `${GATEWAY}/ipfs/${data.IpfsHash}`;
}
