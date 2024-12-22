import { SerializableObject } from "./object"

import type { SerializedObject } from "./object"

export const serialize = (obj: any): SerializedObject => {
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || obj === null || typeof obj === 'undefined') {
    return obj
  }


  if (obj instanceof SerializableObject) {
    return obj.serialize()
  } 
  else if (Array.isArray(obj)) {
    return obj.map(serialize)
  } 
  else if (typeof obj === 'bigint') {
    return {
      __t: 'bigint',
      __j: { value: obj.toString() }
    }
  }  
  else if (typeof obj === 'object') {
    return {
      __t: 'object',
      __j: Object.entries(obj).reduce((r, [k, vi]: [string, any]) => {
        r[k] = serialize(vi)
        return r
      }, {} as Record<string, SerializedObject>)
    }
  }

  return obj
}



export const deserialize = (json: SerializedObject): any => {
  if (!json || typeof json === 'string' || typeof json === 'number' || typeof json === 'boolean' || json === null || typeof json === 'undefined') {
    return json
  } else if (Array.isArray(json)) {
    return json.map(deserialize)
  } else if (json.__t) { 
    if (json.__t === 'bigint') {
      return BigInt(json.__j.value as string)
    } else if (json.__t === 'object') {
      return Object.entries(json.__j).reduce((r, [k, v]) => {
        r[k] = deserialize(v)
        return r
      }, {} as Record<string, any>)
    } else {
      // TODO: instantiate and parse the object
      const obj = new (json.__t as any)()
      obj.setValues(json.__j)
      return obj
    }
  }

  return json
}
