import { ServiceScope } from "src/service-descriptors";

export function isAllowedScope(scope: ServiceScope, owned: boolean): boolean {
    if (owned) {
        return (scope & ServiceScope.container) === ServiceScope.container;
    }
    return (scope & ServiceScope.children) === ServiceScope.children;
}
