import { snakeCase } from 'case-anything'

export const exceptionNameToType = (name: string) => snakeCase(name).toUpperCase()
