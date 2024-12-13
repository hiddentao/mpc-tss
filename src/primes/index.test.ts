import { describe, expect, test } from "bun:test"
import { bitLength } from "bigint-crypto-utils"
import { BITS_BLUM_PRIME } from "../constants"
import { 
  InvalidPrimeBitsError,
  InvalidPrimeFactorError, 
  InvalidPrimeMod4Error,
  findValidBlumPrime, 
  initializePrimes, 
  validateBlumPrime
} from "./index"

describe("Primes", () => {
  test("should initialize primes", async () => {
    await initializePrimes()
  })

  test("should generate valid Blum primes", async () => {
    const p = await findValidBlumPrime()
    
    expect(p % 4n).toBe(3n)
    expect(bitLength(p)).toBeLessThanOrEqual(BITS_BLUM_PRIME)

    await expect(validateBlumPrime(p)).resolves.toBeUndefined()
    
    console.log(`Blum prime: ${p.toString()}`)
  }, { timeout: 60000 })

  describe("validateBlumPrime", () => {
    test("should validate correct Blum prime", async () => {
      const real = [
        179592502110335963336347735108907147317760904272746519157588428198851642173043932077383231024080457777437444199308940940528740158020956955835017958704625931695110457545843284994471316520797998498062474296013358438785968440081020607611888287234488233606613994066898948321434201732737366068220153564935475802567n,
        144651337722999591357894368476987413731327694772730408677878934803626218325763401733049627551150267745019646164141178748986827450041894571742897062718616997949877925740444144291875968298065299373438319317040746398994377200405476019627025944607850551945311780131978961657839712750089596117856255513589953855963n,
        167584440033458454003162584396316146453796089347854796064192516236849844424586761672826512230891497295639945103304578167194136528569225887927899605520133082570264760079250008981898421958964965806367054730752711814821624087572950363886758006454803782991965393800317303231407388946220783846693543285356015980607n,
        151165408883358278424958842746761822049160001463316967852831348458250059843845641376289587768057703844311386381507777221201914668845450661459374695607478178082607000466232585044835515188561581979026928735531961586996509245135647591451131147875889373462872494894073361749806357063867318233050203414568413645839n,
        153094796182817653006547853867208511738854279983936671657448397181320482729136024819768871376086960734705061692321047004806199471561526533336619163666639002572576927059371241834764303576809268065107009682411448158711349112821479777105485359985074515654938870853147517994001407558129995379593869552319046813767n,
      ]
      await Promise.all(real.map(p => validateBlumPrime(p)))
    })

    test("should throw on incorrect bit length", async () => {
      const p = 7n // Small prime with wrong bit length
      await expect(validateBlumPrime(p)).rejects.toThrow(InvalidPrimeBitsError)
    })

    test("should throw on incorrect mod 4", async () => {
      const p = 123873494390672195888139148718088211646566348389239735316906964183569267740017895361977159281026350981645629361741034781587922552081319404771745552556450422417836092559747896606464167627058901644894862816988649003335786437423887590430700606004297919438697430960736637031129431794309046452926429888545577140209n
      await expect(validateBlumPrime(p)).rejects.toThrow(InvalidPrimeMod4Error)
    })

    test("should throw on invalid prime factor", async () => {
      const p = 157000063140359967983036902752032537677059990382751616127430615752745404987178718076211217313232593797045955309047691930102432960992660747083501230458709204175675009825178203784418874850097877331085408852304255279766939061550032622622307985478009072709568312758661084372054558231033281135437719829425009219483n
      await expect(validateBlumPrime(p)).rejects.toThrow(InvalidPrimeFactorError)
    })
  })
})