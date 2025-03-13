# LIFF CLI

## Getting Started

```
$ npm i @line/liff-cli@latest
```

## Usage

### Channel Commands

The `channel` command is used to manage LIFF channels. You can add or set the current channel with the following subcommands:

#### Add a Channel

To add a channel, use the `add` subcommand with the channel ID and channel secret. You will be prompted to enter the channel secret.

```sh
$ liff-cli channel add [channelId]
```

#### Set the Current Channel

To set the current channel, use the `use` subcommand with the channel ID.

```sh
$ liff-cli channel use [channelId]
```

### App Commands

The `app` command is used to manage LIFF apps. You can create, list, or delete LIFF apps with the following subcommands:

#### Create a LIFF App

To create a new LIFF app, use the `create` subcommand with the required options: channel ID (optional), name, endpoint URL, and view type.

```sh
$ liff-cli app create \
    --channel-id [channelId] \
    --name <name> \
    --endpoint-url <endpointUrl> \
    --view-type <viewType>
```

#### Update a LIFF App

To update an existing LIFF app, use the `update` subcommand with the LIFF app ID and the desired options to update. You can update the name, endpoint URL, and view type of the app.

```sh
$ liff-cli app update \
    --liff-id <liffId> \
    --channel-id [channelId] \
    --name [newName] \
    --endpoint-url [endpointUrl] \
    --view-type [viewType]
```

#### List LIFF Apps

To list all LIFF apps, use the `list` subcommand. You can optionally specify a channel ID to list apps for a specific channel.

```sh
$ liff-cli app list \
    --channel-id [channelId]
```

#### Delete a LIFF App

To delete a LIFF app, use the `delete` subcommand with the LIFF app ID.

```sh
$ liff-cli app delete \
    --liff-id <liffId> \
    --channel-id [channelId]
```

### Init Command

The `init` command sets up a development environment for LIFF apps using the LIFF CLI.

This command creates a new LIFF app and uses `@line/create-liff-app` to generate the LIFF app template.

```sh
$ liff-cli init \
    --channel-id [channelId] \
    --name <name> \
    --endpoint-url <endpointUrl> \
    --view-type <viewType>
```

### Scaffold Command

The `scaffold` command is used to create a new LIFF app template using the `@line/create-liff-app` utility.

```sh
$ liff-cli scaffold <app-name> [options]
```

Options:

- `-l, --liff-id [liffId]` - Optional LIFF ID to use with the app template

Example:

```sh
$ liff-cli scaffold my-liff-app
$ liff-cli scaffold my-liff-app --liff-id 1234567-abcdef
```

### Serve Commands

The `serve` command is used to start local dev server with HTTPS and update an endpoint URL.

#### Creating Certificates

Before using the `serve` command, you need to create `localhost.pem` and `localhost-key.pem` in the root directory using `mkcert`. Follow these steps:

1. Install `mkcert` if you haven't already:

```sh
$ brew install mkcert
$ mkcert -install
```

2. Generate the certificates:

```sh
$ mkcert localhost
```

3. Place the generated `localhost.pem` and `localhost-key.pem` files in the root directory of your project.

#### Running the Server

**Before proceeding, ensure that your LIFF app is running locally.** The `url` (or `host` and `port`) used in the following commands should correspond to your locally running LIFF app.

To start the server, use one of the following commands:

```sh
$ liff-cli serve \
    --liff-id <liffId> \
    --url <url>
    --inspect
```

or

```sh
$ liff-cli serve \
    --liff-id <liffId> \
    --host <host>
    --port <port>
    --inspect

```

## Development

### Building

```
$ npm run build
```

### Test

```
$ npm run test
```

### Release

```
$ node --run release
$ git push --follow-tags
```

## Contribution

Please follow [the contributing guidelines](CONTRIBUTING.md) to contribute to the project.

## License

LIFF CLI is under [Apache License, Version 2.0](LICENSE)
