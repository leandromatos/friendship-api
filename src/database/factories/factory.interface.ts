export interface Factory<MC, MCA, MI = void> {
  defaultAttributes: Partial<MC>
  build(attributes: Partial<MC>): MC
  buildPrismaIncludeFromAttrs?(attributes?: Partial<MC>): MI
  create(attributes?: Partial<MC>): MCA
}
