import type { PartyId } from "./types"

export interface PartyPublicKeyConfig {
  // the party this config belongs to
  id: PartyId
  // the party's ECDSA public key share
  ecdsaPublic: bigint
  // the party's ElGamal public key share
  elgamalPublic: bigint
  // the party's Paillier public key share
  paillierPublic: bigint
  // the party's Pedersen public key share
  pedersenPublic: bigint
}

export interface PartySecretKeyConfig extends PartyPublicKeyConfig {
  // the threshold t which defines the maximum number of corruptions tolerated for this config.
  // Threshold + 1 is the minimum number of parties' shares required to reconstruct the secret/sign a message.
  threshold: number
  // the party's share xᵢ of the secret ECDSA x.
  ecdsa: bigint
  // the party's yᵢ used for ElGamal.
  elgamal: bigint
  // the party's Paillier decryption key.
  paillier: bigint
  // A random identifier generated for this config
  randomId: bigint
	// ChainKey is the chaining key value associated with this public key
	chainKey: bigint
	// Public maps party.ID to public. It contains all public information associated to a party.
	publicPartyData: Record<PartyId, PartyPublicKeyConfig>
}

