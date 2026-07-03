export interface SignAdminActionArgs {
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
  parts: (string | number)[]
}

export interface SignedAdminAction {
  timestamp: number
  signature: string
}

// Signs `${prefix}:${...parts}:${timestamp}` so the edge function can
// reconstruct the exact same string and verify the signature. No transaction,
// no gas, no funds at risk — just proof the caller holds this wallet's key.
export async function signAdminAction({ signMessage, parts }: SignAdminActionArgs): Promise<SignedAdminAction> {
  const timestamp = Date.now()
  const message = [...parts, timestamp].join(':')
  const signatureBytes = await signMessage(new TextEncoder().encode(message))
  const signature = bytesToBase64(signatureBytes)
  return { timestamp, signature }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}
