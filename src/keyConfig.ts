import type { Secp256k1_AffinePoint } from "./curves"
import type { PaillierPublicKey } from "./paillier"
import type { PedersenParams } from "./pederson"
import type { PartyId } from "./types"

export class PartyPublicKeyConfig {
  public readonly id: PartyId
  public readonly ecdsa: Secp256k1_AffinePoint
  public readonly elgamal: Secp256k1_AffinePoint
  public readonly paillier: PaillierPublicKey
  public readonly pedersen: PedersenParams

  constructor({
    id,
    ecdsa,
    elgamal,
    paillier,
    pedersen
  }: {
    id: PartyId
    ecdsa: Secp256k1_AffinePoint
    elgamal: Secp256k1_AffinePoint
    paillier: PaillierPublicKey
    pedersen: PedersenParams
  }) {
    this.id = id
    this.ecdsa = ecdsa
    this.elgamal = elgamal
    this.paillier = paillier
    this.pedersen = pedersen
  }
}

export class PartySecretKeyConfig extends PartyPublicKeyConfig {
  public readonly threshold: number
  public readonly ecdsaSecret: bigint
  public readonly elgamalSecret: bigint
  public readonly paillierSecret: bigint
  public readonly randomId: bigint
  public readonly chainKey: bigint
  public readonly publicPartyData: Record<PartyId, PartyPublicKeyConfig>

  constructor({
    id,
    ecdsa,
    elgamal,
    paillier,
    pedersen,
    threshold,
    ecdsaSecret,
    elgamalSecret,
    paillierSecret,
    randomId,
    chainKey,
    publicPartyData
  }: {
    id: PartyId
    ecdsa: Secp256k1_AffinePoint
    elgamal: Secp256k1_AffinePoint
    paillier: PaillierPublicKey
    pedersen: PedersenParams
    threshold: number
    ecdsaSecret: bigint
    elgamalSecret: bigint
    paillierSecret: bigint
    randomId: bigint
    chainKey: bigint
    publicPartyData: Record<PartyId, PartyPublicKeyConfig>
  }) {
    super({id, ecdsa, elgamal, paillier, pedersen})
    this.threshold = threshold
    this.ecdsaSecret = ecdsaSecret
    this.elgamalSecret = elgamalSecret
    this.paillierSecret = paillierSecret
    this.randomId = randomId
    this.chainKey = chainKey
    this.publicPartyData = publicPartyData
  }
}

