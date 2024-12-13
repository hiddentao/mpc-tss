import { Bot } from "./bot"
import { Bounds } from "./bounds"
import { HorizontalBounds, VerticalBounds } from "./bounds"
import { Camera } from "./camera"
import { Character } from "./character"
import { CollisionBoxes } from "./collision"
import { DataObject } from "./common"
import { BotStateExpr, CharacterStateExpr } from "./expr"
import { Size } from "./size"
import { SpineRig } from "./sprite"
import { Stage, StageImage } from "./stage"
import { BotState, CharacterState, StateStep } from "./states"
import { Tiling } from "./tiling"
import { Vec } from "./vec"
import { Zoom } from "./zoom"

/**
 * Map of type names to classes.
 */
const TYPE_MAP: Record<string, any> = {
  Bot, BotState, BotStateExpr,
  Bounds, HorizontalBounds, VerticalBounds,
  Camera,
  Character, CharacterState, CharacterStateExpr,
  CollisionBoxes,
  Size,
  Stage, StageImage,
  StateStep,
  SpineRig,
  Tiling,
  Vec,
  Zoom,
}


/**
 * Raw JSON type.
 */
export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };


/**
 * Structure of JSON representing a serialized objects.
 */
export type SerializedJson = {
  /** Serialied value class type */
  __t?: string,
  /** Serialized value's child props */
  c?: Json,
}


/**
 * Serialize an object.
 */
const _serialize = (obj: any): any => {
  if (!obj) {
    return obj
  }

  if (!obj.getSerializableProps) {
    if (Array.isArray(obj)) {
      return obj.map(_serialize)
    } 
    else if (typeof obj === 'object') {
      return Object.entries(obj).reduce((r, [k, vi]: [string, any]) => {
        r[k] = _serialize(vi)
        return r
      }, {} as Record<string, any>)
    } else {
      return obj
    }
  }

  const fnd = Object.entries(TYPE_MAP).find(([ /*name*/, Klass ]) => {
    return obj instanceof Klass
  })
  const [ __t ] = fnd!
  
  const props = (obj as DataObject).getSerializableProps()

  return {
    __t,
    c: props.reduce((ret: Record<string, any>, p: string) => {
      const v = obj[p]
      ret[p] = (v ? _serialize(v) : v)
      return ret
    }, {} as Record<string, any>) as Json
  }
}


/**
 * Deserialize an object.
 */
const _deserialize = (obj: any): any => {
  if (!obj) {
    return obj
  }

  if (!obj.__t) {
    if (Array.isArray(obj)) {
      return obj.map(_deserialize)
    }
    else if (typeof obj === 'object') {
      return Object.entries(obj).reduce((r, [k, vi]: [string, any]) => {
        r[k] = _deserialize(vi)
        return r
      }, {} as Record<string, any>)
    } else {
      return obj
    }
  }

  const children = obj.c || {}

  const props = Object.entries(children).reduce((ret, [ n, v ]) => {
    ret[n] = _deserialize(v)
    return ret
  }, {} as Record<string, any>)

  const Klass = TYPE_MAP[obj.__t!] as any

  return Klass.new(props)
}



/**
 * Serialize given object.
 * @param obj object to serialize.
 * @returns 
 */
export const toJSON = (obj: DataObject): SerializedJson => {
  return _serialize(obj)
}

/**
 * Deserialize given object.
   * @param serializedJson previously serialized object.
 */
export const fromJSON = (serializedJson: SerializedJson): DataObject => {
  return _deserialize(serializedJson)
}