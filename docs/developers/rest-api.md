# REST API

The Recontent.app API is organized around [REST](http://en.wikipedia.org/wiki/Representational\_State\_Transfer). Our API has predictable resource-oriented URLs, accepts [JSON-encoded](http://www.json.org/) request bodies, returns [JSON-encoded](http://www.json.org/) responses, and uses standard HTTP response codes, authentication, and verbs.

### Authentication

The Recontent.app API uses API keys to authenticate requests. You can view and manage your API keys in your workspace integrations settings.

API keys are sent for each request in an `Authorization` header. If your API key is `123456`, each request must send the following header: `Authorization: Bearer 123456`.



{% swagger src="https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml" path="/workspaces/me" method="get" %}
[https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml](https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml)
{% endswagger %}

{% swagger src="https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml" path="/languages" method="get" %}
[https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml](https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml)
{% endswagger %}

{% swagger src="https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml" path="/projects" method="get" %}
[https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml](https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml)
{% endswagger %}

{% swagger src="https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml" path="/projects/{id}" method="get" %}
[https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml](https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml)
{% endswagger %}

{% swagger src="https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml" path="/phrases" method="get" %}
[https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml](https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml)
{% endswagger %}

{% swagger src="https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml" path="/phrases/{id}" method="get" %}
[https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml](https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml)
{% endswagger %}

{% swagger src="https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml" path="/phrase-exports" method="post" %}
[https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml](https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml)
{% endswagger %}

{% swagger src="https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml" path="/possible-locales" method="get" %}
[https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml](https://raw.githubusercontent.com/recontentapp/recontentapp/master/openapi/public-api.yml)
{% endswagger %}
