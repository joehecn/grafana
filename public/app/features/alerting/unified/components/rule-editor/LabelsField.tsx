import { css, cx } from '@emotion/css';
import { flattenDeep, compact } from 'lodash';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { GrafanaTheme, SelectableValue } from '@grafana/data';
import { Stack } from '@grafana/experimental';
import { Button, Field, InlineLabel, Label, useStyles, Tooltip, Icon, Input } from '@grafana/ui';
import { useDispatch } from 'app/types';
import { RulerRuleGroupDTO } from 'app/types/unified-alerting-dto';

import { useUnifiedAlertingSelector } from '../../hooks/useUnifiedAlertingSelector';
import { fetchRulerRulesIfNotFetchedYet } from '../../state/actions';
import { RuleFormType, RuleFormValues } from '../../types/rule-form';
import AlertLabelDropdown from '../AlertLabelDropdown';

interface Props {
  className?: string;
  suggest: boolean;
  dataSourceName?: string | null;
}

const useGetCustomLabels = (dataSourceName: string): Record<string, string[]> => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchRulerRulesIfNotFetchedYet(dataSourceName));
  }, [dispatch, dataSourceName]);

  const rulerRuleRequests = useUnifiedAlertingSelector((state) => state.rulerRules);

  const rulerRequest = rulerRuleRequests[dataSourceName];

  if (!rulerRequest || rulerRequest.loading) {
    return {};
  }

  const result = rulerRequest.result || {};

  //store all labels in a flat array and remove empty values
  const labels = compact(
    flattenDeep(
      Object.keys(result).map((ruleGroupKey) =>
        result[ruleGroupKey].map((ruleItem: RulerRuleGroupDTO) => ruleItem.rules.map((item) => item.labels))
      )
    )
  );

  const labelsByKey: Record<string, string[]> = {};

  labels.forEach((label: Record<string, string>) => {
    Object.entries(label).forEach(([key, value]) => {
      labelsByKey[key] = [...new Set([...(labelsByKey[key] || []), value])];
    });
  });

  return labelsByKey;
};

function mapLabelsToOptions(items: string[] = []): Array<SelectableValue<string>> {
  return items.map((item) => ({ label: item, value: item }));
}

const LabelsWithSuggestions: FC<{ dataSourceName?: string | null }> = ({ dataSourceName }) => {
  const styles = useStyles(getStyles);
  const {
    register,
    control,
    watch,
    formState: { errors },
    setValue,
  } = useFormContext<RuleFormValues>();

  const labels = watch('labels');
  const { fields, remove, append } = useFieldArray({ control, name: 'labels' });

  const labelsByKey = useGetCustomLabels(dataSourceName || RuleFormType.grafana);

  const [selectedKey, setSelectedKey] = useState('');

  const keys = useMemo(() => {
    return mapLabelsToOptions(Object.keys(labelsByKey));
  }, [labelsByKey]);

  const getValuesForLabel = useCallback(
    (key: string) => {
      return mapLabelsToOptions(labelsByKey[key]);
    },
    [labelsByKey]
  );

  const values = useMemo(() => {
    return getValuesForLabel(selectedKey);
  }, [selectedKey, getValuesForLabel]);

  return (
    <>
      {fields.map((field, index) => {
        return (
          <div key={field.id}>
            <div className={cx(styles.flexRow, styles.centerAlignRow)}>
              <Field
                className={styles.labelInput}
                invalid={Boolean(errors.labels?.[index]?.key?.message)}
                error={errors.labels?.[index]?.key?.message}
                data-testid={`label-key-${index}`}
              >
                <AlertLabelDropdown
                  {...register(`labels.${index}.key`, {
                    required: { value: Boolean(labels[index]?.value), message: 'Required.' },
                  })}
                  defaultValue={field.key ? { label: field.key, value: field.key } : undefined}
                  options={keys}
                  onChange={(newValue: SelectableValue) => {
                    setValue(`labels.${index}.key`, newValue.value);
                    setSelectedKey(newValue.value);
                  }}
                  type="key"
                />
              </Field>
              <InlineLabel className={styles.equalSign}>=</InlineLabel>
              <Field
                className={styles.labelInput}
                invalid={Boolean(errors.labels?.[index]?.value?.message)}
                error={errors.labels?.[index]?.value?.message}
                data-testid={`label-value-${index}`}
              >
                <AlertLabelDropdown
                  {...register(`labels.${index}.value`, {
                    required: { value: Boolean(labels[index]?.key), message: 'Required.' },
                  })}
                  defaultValue={field.value ? { label: field.value, value: field.value } : undefined}
                  options={values}
                  onChange={(newValue: SelectableValue) => {
                    setValue(`labels.${index}.value`, newValue.value);
                  }}
                  onOpenMenu={() => {
                    setSelectedKey(labels[index].key);
                  }}
                  type="value"
                />
              </Field>

              <Button
                className={styles.deleteLabelButton}
                aria-label="delete label"
                icon="trash-alt"
                data-testid={`delete-label-${index}`}
                variant="secondary"
                onClick={() => {
                  remove(index);
                }}
              />
            </div>
          </div>
        );
      })}
      <Button
        className={styles.addLabelButton}
        icon="plus-circle"
        type="button"
        variant="secondary"
        onClick={() => {
          append({});
        }}
      >
        Add label
      </Button>
    </>
  );
};

const LabelsWithoutSuggestions: FC = () => {
  const styles = useStyles(getStyles);
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<RuleFormValues>();

  const labels = watch('labels');
  const { fields, remove, append } = useFieldArray({ control, name: 'labels' });

  return (
    <>
      {fields.map((field, index) => {
        return (
          <div key={field.id}>
            <div className={cx(styles.flexRow, styles.centerAlignRow)}>
              <Field
                className={styles.labelInput}
                invalid={!!errors.labels?.[index]?.key?.message}
                error={errors.labels?.[index]?.key?.message}
              >
                <Input
                  {...register(`labels.${index}.key`, {
                    required: { value: !!labels[index]?.value, message: 'Required.' },
                  })}
                  placeholder="key"
                  data-testid={`label-key-${index}`}
                  defaultValue={field.key}
                />
              </Field>
              <InlineLabel className={styles.equalSign}>=</InlineLabel>
              <Field
                className={styles.labelInput}
                invalid={!!errors.labels?.[index]?.value?.message}
                error={errors.labels?.[index]?.value?.message}
              >
                <Input
                  {...register(`labels.${index}.value`, {
                    required: { value: !!labels[index]?.key, message: 'Required.' },
                  })}
                  placeholder="value"
                  data-testid={`label-value-${index}`}
                  defaultValue={field.value}
                />
              </Field>

              <Button
                className={styles.deleteLabelButton}
                aria-label="delete label"
                icon="trash-alt"
                data-testid={`delete-label-${index}`}
                variant="secondary"
                onClick={() => {
                  remove(index);
                }}
              />
            </div>
          </div>
        );
      })}
      <Button
        className={styles.addLabelButton}
        icon="plus-circle"
        type="button"
        variant="secondary"
        onClick={() => {
          append({});
        }}
      >
        Add label
      </Button>
    </>
  );
};

const LabelsField: FC<Props> = ({ className, suggest, dataSourceName }) => {
  const styles = useStyles(getStyles);

  return (
    <div className={cx(className, styles.wrapper)}>
      <Label>
        <Stack gap={0.5}>
          <span>Custom Labels</span>
          <Tooltip
            content={
              <div>
                Labels shown as suggestions in the dropdowns come from previously entered labels in other alert rules.
                They do not represent the full set of labels for the alert.
              </div>
            }
          >
            <Icon className={styles.icon} name="info-circle" size="sm" />
          </Tooltip>
        </Stack>
      </Label>
      <>
        <div className={styles.flexRow}>
          <InlineLabel width={18}>Labels</InlineLabel>
          <div className={styles.flexColumn}>
            {suggest && <LabelsWithSuggestions dataSourceName={dataSourceName} />}
            {!suggest && <LabelsWithoutSuggestions />}
          </div>
        </div>
      </>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme) => {
  return {
    icon: css`
      margin-right: ${theme.spacing.xs};
    `,
    wrapper: css`
      margin-bottom: ${theme.spacing.xl};
    `,
    flexColumn: css`
      display: flex;
      flex-direction: column;
    `,
    flexRow: css`
      display: flex;
      flex-direction: row;
      justify-content: flex-start;

      & + button {
        margin-left: ${theme.spacing.xs};
      }
    `,
    deleteLabelButton: css`
      margin-left: ${theme.spacing.xs};
      align-self: flex-start;
    `,
    addLabelButton: css`
      flex-grow: 0;
      align-self: flex-start;
    `,
    centerAlignRow: css`
      align-items: baseline;
    `,
    equalSign: css`
      align-self: flex-start;
      width: 28px;
      justify-content: center;
      margin-left: ${theme.spacing.xs};
    `,
    labelInput: css`
      width: 175px;
      margin-bottom: ${theme.spacing.sm};
      & + & {
        margin-left: ${theme.spacing.sm};
      }
    `,
  };
};

export default LabelsField;
