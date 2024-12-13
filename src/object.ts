/** No. of ticks per second */
export const TICKS_PER_SECOND = 60


/**
 * Structure of JSON representing a serialized object.
 */
export type SerializedJson = string | number | boolean | null | SerializedJson[] | {
  /** Serialied value class name */
  __t: string,
  /** Serialized value */
  j: Record<string, SerializedJson>,
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
        if (!key.startsWith("_")) {
          // @ts-ignore-next-line
          this[key] = val
        }
      })
    }
  }

  /**
   * Get list of fields which can be serialized/de-serialized.
   * @see Serializer
   */
  public getSerializableProps(): string[] {
    const keys = Object.keys(this)
    return keys.filter((k) => !k.startsWith("_"))
  }


  /**
   * Get `SerializedJson` representation of this object.
   * @returns `SerializedJson` representation of this object.
   */
  public toJSON(): SerializedJson {
    const ret: Record<string, SerializedJson> = {}

    for (let k of this.getSerializableProps()) {
      ret[k] = this[k]
    }

    return ret
  }
}


export const toJSON = (obj: any): SerializedJson => {
  if (!obj) {
    return obj
  }

  if (obj instanceof SerializableObject) {
    return obj.toJSON()
  } else if (Array.isArray(obj)) {
    return obj.map(toJSON)
  } 
  else if (typeof obj === 'object') {
    return {
      __t: 'object',
      j: Object.entries(obj).reduce((r, [k, vi]: [string, any]) => {
        r[k] = toJSON(vi)
        return r
      }, {} as Record<string, SerializedJson>)
    }
  }

  return obj
}



export const fromJSON = (json: SerializedJson): any => {
  if (!json) {
    return json
  } else if (typeof json === 'string' || typeof json === 'number' || typeof json === 'boolean' || json === null) {
    return json
  } else if (Array.isArray(json)) {
    return json.map(fromJSON)
  } else if (json.__t) { 
    if (json.__t === 'object') {
      return Object.entries(json.j).reduce((r, [k, v]) => {
        r[k] = fromJSON(v)
        return r
      }, {} as Record<string, any>)
    } else {
      // TODO: instantiate and parse the object
      const obj = new (json.__t as any)()
      obj.setValues(json.j)
      return obj
    }
  }

  return json
}
