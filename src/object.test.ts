import { beforeEach, describe, expect, test } from "bun:test"
import { SerializableObject, Serializer, SerializerUnknownTypeError } from './object'

class TestObject extends SerializableObject {
  public name: string = ''
  public age: number = 0
  private _secret: string = 'hidden'
}

class ComplexObject extends SerializableObject {
  public nested: TestObject = new TestObject()
  public array: number[] = []
  public map: Record<string, TestObject> = {}
  public _private: string = 'private'
  
  public override getSerializableValues() {
    const values = super.getSerializableValues()
    delete values.map // Exclude map from serialization
    return values
  }
}

describe('serializable objects', () => {
  describe('Serializer', () => {
    beforeEach(() => {
      Serializer.addType('TestObject', TestObject)
      Serializer.addType('ComplexObject', ComplexObject) 
    })

    describe('serialize', () => {
      test('handles primitive types', () => {
        expect(Serializer.serialize('test')).toBe('test')
        expect(Serializer.serialize(123)).toBe(123)
        expect(Serializer.serialize(true)).toBe(true)
        expect(Serializer.serialize(null)).toBe(null)
      })

      test('handles BigInt', () => {
        const result = Serializer.serialize(BigInt(123))
        expect(result).toEqual({
          __t: 'bigint',
          __j: { value: '123' }
        })
      })

      test('handles arrays', () => {
        const arr = [1, 'test', true]
        expect(Serializer.serialize(arr)).toEqual(arr)
      })

      test('handles plain objects', () => {
        const obj = { a: 1, b: 'test' }
        expect(Serializer.serialize(obj)).toEqual({
          __t: 'object',
          __j: obj
        })
      })

      test('handles SerializableObject instances', () => {
        const obj = TestObject.new({ name: 'test', age: 30 })
        expect(Serializer.serialize(obj)).toEqual({
          __t: 'TestObject',
          __j: { name: 'test', age: 30 }
        })
      })

      test('handles complex nested structures', () => {
        const complex = ComplexObject.new({
          nested: TestObject.new({ name: 'nested', age: 25 }),
          array: [1, 2, 3],
          map: { key: TestObject.new({ name: 'mapped' }) }
        })

        const result = Serializer.serialize(complex)
        expect(result).toEqual({
          __t: 'ComplexObject',
          __j: {
            nested: {
              __t: 'TestObject',
              __j: { name: 'nested', age: 25 }
            },
            array: [1, 2, 3]
          }
        })
      })
    })

    describe('deserialize', () => {
      test('handles primitive types', () => {
        expect(Serializer.deserialize('test')).toBe('test')
        expect(Serializer.deserialize(123)).toBe(123)
        expect(Serializer.deserialize(true)).toBe(true)
        expect(Serializer.deserialize(null)).toBe(null)
      })

      test('handles BigInt', () => {
        const serialized = { __t: 'bigint', __j: { value: '123' } }
        expect(Serializer.deserialize(serialized)).toBe(BigInt(123))
      })

      test('handles arrays', () => {
        const arr = [1, 'test', true]
        expect(Serializer.deserialize(arr)).toEqual(arr)
      })

      test('handles plain objects', () => {
        const serialized = {
          __t: 'object',
          __j: { a: 1, b: 'test' }
        }
        expect(Serializer.deserialize(serialized)).toEqual({ a: 1, b: 'test' })
      })

      test('handles SerializableObject instances', () => {
        const serialized = {
          __t: 'TestObject',
          __j: { name: 'test', age: 30 }
        }
        const result = Serializer.deserialize(serialized) as TestObject
        expect(result).toBeInstanceOf(TestObject)
        expect(result.name).toBe('test')
        expect(result.age).toBe(30)
      })

      test('handles complex nested structures', () => {
        const serialized = {
          __t: 'ComplexObject',
          __j: {
            nested: {
              __t: 'TestObject',
              __j: { name: 'nested', age: 25 }
            },
            array: [1, 2, 3]
          }
        }

        const result = Serializer.deserialize(serialized) as ComplexObject
        expect(result).toBeInstanceOf(ComplexObject)
        expect(result.nested).toBeInstanceOf(TestObject)
        expect(result.nested.name).toBe('nested')
        expect(result.array).toEqual([1, 2, 3])
        expect(result.map).toEqual({})
      })

      test('throws on unknown type', () => {
        const serialized = {
          __t: 'UnknownType',
          __j: {}
        }
        expect(() => Serializer.deserialize(serialized)).toThrow()
      })

      test('throws SerializerUnknownTypeError with correct message', () => {
        const serialized = {
          __t: 'UnknownType',
          __j: {}
        }
        expect(() => Serializer.deserialize(serialized))
          .toThrow('Serializer: unknown type: UnknownType')
        expect(() => Serializer.deserialize(serialized))
          .toThrow(SerializerUnknownTypeError)
      })
    })
  })

  describe('SerializableObject', () => {
    test('classes can be instantiated with new', () => {
      expect(() => new TestObject()).not.toThrow()
      expect(() => new ComplexObject()).not.toThrow()
    })

    test('new() sets values correctly', () => {
      const obj = TestObject.new({ name: 'test', age: 30 })
      expect(obj.name).toBe('test')
      expect(obj.age).toBe(30)
    })

    test('getSerializableValues() excludes underscore prefixed properties', () => {
      const obj = TestObject.new({ name: 'test', _secret: 'exposed' })
      const values = obj.getSerializableValues()
      expect(values).toHaveProperty('name')
      expect(values).not.toHaveProperty('_secret')
    })

    test('respects overridden getSerializableValues()', () => {
      const complex = ComplexObject.new({
        nested: TestObject.new({ name: 'test' }),
        map: { key: TestObject.new({ name: 'mapped' }) }
      })
      const values = complex.getSerializableValues()
      expect(values).toHaveProperty('nested')
      expect(values).not.toHaveProperty('map')
      expect(values).not.toHaveProperty('_private')
    })
  })
}) 