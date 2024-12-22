import { CustomError } from 'ts-custom-error'


/**
 * Structure of JSON representing a serialized object.
 */
export type SerializedObject = string | number | boolean | null | SerializedObject[] | {
  /** Serialied value class name */
  __t: string,
  /** Serialized value */
  __j: Record<string, SerializedObject>,
}


/**
 * Base class for all objects that can be serialized.
 */
export class SerializableObject {
  /**
   * Allocate a new instance of this class.
   *
   * @param values values to set.
   */
  public static new<T extends typeof SerializableObject>(
    this: T,
    values?: Record<string, any>
  ): InstanceType<T> {
    const v = new this()
    if (values) {
      v.setValues(values)
    }
    return v as InstanceType<T>
  }

  /**
   * Set field values.
   *
   * @param values field values.
   */
  public setValues(values?: Record<string, any>) {
    if (values) {
      Object.entries(values).forEach(([key, val]) => {
        // @ts-ignore-next-line
        this[key] = val
      })
    }
  }

  /**
   * Get values which should be serialized/de-serialized.
   * 
   * By default all fields which are not prefixed with underscore are serialized.
   * 
   * @see Serializer
   */
  public getSerializableValues(): Record<string, any> {
    return Object.keys(this).reduce((r, k) => {
      if (!k.startsWith("_")) {
        r[k] = this[k as keyof this]
      }
      return r
    }, {} as Record<string, any>)
  }
}


export class Serializer {
  private static TYPE_MAP: Record<string, typeof SerializableObject> = {}

  public static addType(type: string, klass: typeof SerializableObject) {
    this.TYPE_MAP[type] = klass
  }

  private static _serializeValues(values: Record<string, any>): Record<string, SerializedObject> {
    return Object.entries(values).reduce((r, [k, vi]: [string, any]) => {
        if (typeof vi !== 'undefined') {
          r[k] = Serializer.serialize(vi)
        }
        return r
      }, {} as Record<string, SerializedObject>)
  }


  public static serialize(obj: any): SerializedObject {
    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || obj === null) {
      return obj
    }
    else if (typeof obj === 'bigint') {
      return {
        __t: 'bigint',
        __j: { value: obj.toString() }
      }
    }  
    else if (obj instanceof SerializableObject) {
      return {
        __t: obj.constructor.name,
        __j: Serializer._serializeValues(obj.getSerializableValues())
      }
    } 
    else if (Array.isArray(obj)) {
      return obj.map(Serializer.serialize)
    } 
    else if (typeof obj === 'object') {
      return {
        __t: 'object',
        __j: Serializer._serializeValues(obj)
      }
    }

    return obj
  }


  private static _deserializeValues(values: Record<string, SerializedObject>): Record<string, any> {
    return Object.entries(values).reduce((r, [k, vi]: [string, SerializedObject]) => {
      r[k] = Serializer.deserialize(vi)
      return r
    }, {} as Record<string, any>)
  }  

  public static deserialize(json: SerializedObject): any {
    if (!json || typeof json === 'string' || typeof json === 'number' || typeof json === 'boolean' || json === null || typeof json === 'undefined') {
      return json
    } else if (Array.isArray(json)) {
      return json.map(Serializer.deserialize)
    } else if (json.__t) { 
      if (json.__t === 'bigint') {
        return BigInt(json.__j.value as string)
      } else if (json.__t === 'object') {
        return Serializer._deserializeValues(json.__j)
      } else {
        const Klass = this.TYPE_MAP[json.__t!] as any
        if (typeof Klass === 'undefined') {
          throw new SerializerUnknownTypeError(json.__t!)
        }
        return Klass.new(Serializer._deserializeValues(json.__j))
      }
    }

    return json
  }
}

export class SerializerUnknownTypeError extends CustomError {
  constructor(type: string) {
    super(`Serializer: unknown type: ${type}`)
  }
}
