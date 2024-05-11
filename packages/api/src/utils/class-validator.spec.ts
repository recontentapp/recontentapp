import { IsNotEmpty, IsString, validateSync } from 'class-validator'
import { IsNullable, OneOf } from './class-validator'

describe('IsNullable', () => {
  it('should validate nullable values', () => {
    class Test {
      @IsNullable()
      value: string | null
    }

    const test = new Test()
    test.value = null

    expect(validateSync(test)).toHaveLength(0)
  })
})

describe('OneOf', () => {
  it('should validate when value is one of the types', () => {
    class Car {
      @IsString()
      @IsNotEmpty()
      name: string
    }

    class Motorbike {
      @IsString()
      @IsNotEmpty()
      surname: string
    }

    class Test {
      @OneOf([() => Car, () => Motorbike])
      value: Car | Motorbike
    }

    const test = new Test()
    test.value = { name: 'Test card' }

    expect(validateSync(test)).toHaveLength(0)
  })

  it('should not validate when value is an unknown types', () => {
    class Car {
      @IsString()
      @IsNotEmpty()
      name: string
    }

    class Motorbike {
      @IsString()
      @IsNotEmpty()
      surname: string
    }

    class Test {
      @OneOf([() => Car, () => Motorbike])
      value: Car | Motorbike
    }

    const test = new Test()
    // @ts-expect-error Testing unknown type
    test.value = { lastName: 'Test unknown' }

    expect(validateSync(test)).toHaveLength(1)
  })
})
