package main

import (
	module "github.com/wapc/widl-codegen/tinygo"
)

func main() {
	module.Handlers{
		TestFunction: testFunction,
	}.Register()
}

func testFunction(required module.Required, optional module.Optional, maps module.Maps, lists module.Lists) (module.Tests, error) {
	return module.Tests{}, nil // TODO: Provide implementation.
}
