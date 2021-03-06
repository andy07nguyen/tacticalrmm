import { mount, createLocalVue } from "test-utils";
import flushpromises from "flush-promises";
import Vuex from "vuex";
import PolicyAdd from "@/components/automation/modals/PolicyAdd";
import "../../utils/quasar.js";

const localVue = createLocalVue();
localVue.use(Vuex);

const related = {
    id: 1,
    name: "Test Policy"
  };

let state, actions, getters, store;
beforeEach(() => {

  state = {
    policies: [
      related,
      {
        id: 2,
        name: "Test Policy 2"
      },
      {
        id: 3,
        name: "TestPolicy 3"
      }
    ]
  };

  actions = {
    updateRelatedPolicies: jest.fn(),
    loadPolicies: jest.fn(),
    getRelatedPolicies: jest.fn(() => Promise.resolve({ data: related })),
  };

  getters = {
    policies: (state) => {
      return state.policies
    }
  };

  store = new Vuex.Store({
    modules: {
      automation: {
        namespaced: true,
        state,
        getters,
        actions
      }
    }
  });

})

describe.each([
  [1, "client"],
  [2, "site"],
  [3, "agent"]
])("PolicyAdd.vue with pk:%i and %s type", (pk, type) => {

  let wrapper;
  beforeEach(() => {
    wrapper = mount(PolicyAdd, {
      localVue,
      store,
      propsData: {
        pk: pk,
        type: type
      }
    });
  });

  it("calls vuex actions on mount", async () => {

    await flushpromises();
    expect(actions.loadPolicies).toHaveBeenCalled();
    expect(actions.getRelatedPolicies).toHaveBeenCalledWith(expect.anything(),
      {pk: pk, type: type}
    );

  });

  it("renders title correctly", () => {
    
    expect(wrapper.find(".text-h6").text()).toBe(`Edit policy assigned to ${type}`);
  });

  it("renders correct amount of policies in dropdown", async () => {
    
    await flushpromises();
    expect(wrapper.vm.options).toHaveLength(3);
  });

  it("renders correct policy in selected", async () => {
    
    await flushpromises();
    expect(wrapper.vm.selected).toStrictEqual({label: related.name, value: related.id});
  });

  it("sends correct data on form submit", async () => {
    
    await flushpromises();
    const form = wrapper.findComponent({ ref: "form" });

    await form.vm.$emit("submit");

    expect(actions.updateRelatedPolicies).toHaveBeenCalledWith(expect.anything(),
      { pk: pk, type: type, policy: related.id }
    );

  });
});
