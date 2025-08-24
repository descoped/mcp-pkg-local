/**
 * TypeScript template generators for AST extraction tests
 * These templates generate valid TypeScript declaration syntax for testing purposes
 */

export function generateLargeInterface(interfaceName: string): string {
  return `export interface ${interfaceName} {
  property1: string;
  property2: number;
  property3: boolean;
  method1(): void;
  method2(param: string): Promise<void>;
  nestedObject: {
    nested1: string;
    nested2: number;
    nested3: {
      deep1: boolean;
      deep2: string[];
    };
  };
}`;
}

export function generateLargeClass(className: string, interfaceName: string): string {
  return `export class ${className} implements ${interfaceName} {
  property1 = 'value';
  property2 = 42;
  property3 = true;
  
  method1(): void {
    // Implementation
  }
  
  async method2(param: string): Promise<void> {
    // Implementation
  }
  
  get nestedObject() {
    return {
      nested1: 'value',
      nested2: 123,
      nested3: {
        deep1: false,
        deep2: ['a', 'b', 'c']
      }
    };
  }
}`;
}

export function generateLargeType(typeName: string, interfaceName: string): string {
  return `export type ${typeName} = {
  field1: string;
  field2: number;
  field3: ${interfaceName};
};`;
}

export function generateMassiveInterface(properties: string): string {
  return `export interface MassiveInterface {
${properties}
}`;
}

export function generateSimpleClass(className: string): string {
  return `export class ${className} {
  method1(): void {}
  method2(): string { return ''; }
  method3(): number { return 0; }
}`;
}

/**
 * Generate a complete TypeScript package with interfaces, classes, and types
 */
export function generateCompleteTypeScriptPackage(
  interfaceCount: number,
  baseInterfaceName = 'LargeInterface',
  baseClassName = 'LargeClass',
  baseTypeName = 'LargeType',
): string {
  const components: string[] = [];

  for (let i = 0; i < interfaceCount; i++) {
    const interfaceName = `${baseInterfaceName}${i}`;
    const className = `${baseClassName}${i}`;
    const typeName = `${baseTypeName}${i}`;

    // Add interface
    components.push(generateLargeInterface(interfaceName));
    components.push(''); // Empty line

    // Add class
    components.push(generateLargeClass(className, interfaceName));
    components.push(''); // Empty line

    // Add type
    components.push(generateLargeType(typeName, interfaceName));
    components.push(''); // Empty line
  }

  return components.join('\n');
}
